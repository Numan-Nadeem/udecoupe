"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { rssSources } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin-auth"
import { logAudit } from "@/lib/audit"

const sourceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2000)
    .refine((u) => u.startsWith("https://") || u.startsWith("http://"), "Must be an http(s) URL"),
})

export type SourceFormState = {
  error?: string
  success?: boolean
}

export async function createSource(_prev: SourceFormState, formData: FormData): Promise<SourceFormState> {
  await requireAdmin()

  const parsed = sourceSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  try {
    const inserted = await db
      .insert(rssSources)
      .values({ name: parsed.data.name, url: parsed.data.url, isActive: true, failCount: 0 })
      .returning({ id: rssSources.id })

    await logAudit({
      action: "create",
      entity: "rss_source",
      entityId: inserted[0]?.id,
      changedFields: { name: parsed.data.name, url: parsed.data.url },
    })
  } catch (e: unknown) {
    const message = e instanceof Error && e.message.includes("unique") ? "A source with this name or URL already exists" : "Failed to create source"
    return { error: message }
  }

  revalidatePath("/admin/sources")
  return { success: true }
}

export async function toggleSource(id: number): Promise<void> {
  await requireAdmin()
  if (!Number.isInteger(id) || id < 1) return

  const rows = await db.select({ isActive: rssSources.isActive }).from(rssSources).where(eq(rssSources.id, id)).limit(1)
  if (rows.length === 0) return

  const next = !rows[0].isActive
  await db.update(rssSources).set({ isActive: next }).where(eq(rssSources.id, id))
  await logAudit({
    action: next ? "activate" : "deactivate",
    entity: "rss_source",
    entityId: id,
  })
  revalidatePath("/admin/sources")
}

export async function deleteSource(id: number): Promise<void> {
  await requireAdmin()
  if (!Number.isInteger(id) || id < 1) return

  await db.delete(rssSources).where(eq(rssSources.id, id))
  await logAudit({ action: "delete", entity: "rss_source", entityId: id })
  revalidatePath("/admin/sources")
}
