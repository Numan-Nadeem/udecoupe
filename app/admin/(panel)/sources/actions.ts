"use server"

import { z } from "zod"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { rssSources, cronLogs } from "@/lib/schema"
import { requireAdmin } from "@/lib/session"
import { logAuditEvent } from "@/lib/audit"
import { ingestSource } from "@/lib/ingest"
import { getAffiliateId } from "@/lib/affiliate"

const sourceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2000)
    .refine((u) => u.startsWith("https://") || u.startsWith("http://"), "Must be an http(s) URL"),
})

export async function createSource(formData: FormData): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const parsed = sourceSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { name, url } = parsed.data

  const [byName, byUrl] = await Promise.all([
    db.query.rssSources.findFirst({ where: eq(rssSources.name, name), columns: { id: true } }),
    db.query.rssSources.findFirst({ where: eq(rssSources.url, url), columns: { id: true } }),
  ])
  if (byName) return { error: "A source with this name already exists" }
  if (byUrl) return { error: "A source with this URL already exists" }

  const inserted = await db
    .insert(rssSources)
    .values({ name, url, isActive: true, failCount: 0 })
    .returning({ id: rssSources.id })

  await logAuditEvent("create", "rss_sources", inserted[0]?.id ?? null, { name, url })
  revalidatePath("/admin/sources")
  return { error: null }
}

export async function toggleSourceActive(id: number): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }
  if (!Number.isInteger(id) || id <= 0) return { error: "Invalid source id" }

  const existing = await db.query.rssSources.findFirst({
    where: eq(rssSources.id, id),
    columns: { id: true, name: true, isActive: true },
  })
  if (!existing) return { error: "Source not found" }

  const next = !existing.isActive
  // Per spec: reset fail_count when re-activating a source
  await db
    .update(rssSources)
    .set(next ? { isActive: next, failCount: 0 } : { isActive: next })
    .where(eq(rssSources.id, id))

  await logAuditEvent(next ? "activate" : "deactivate", "rss_sources", id, {
    name: existing.name,
    isActive: { from: existing.isActive, to: next },
  })
  revalidatePath("/admin/sources")
  return { error: null }
}

export async function fetchSourceNow(
  id: number,
): Promise<{ error: string | null; added?: number; itemErrors?: number }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }
  if (!Number.isInteger(id) || id <= 0) return { error: "Invalid source id" }

  const source = await db.query.rssSources.findFirst({
    where: eq(rssSources.id, id),
  })
  if (!source) return { error: "Source not found" }

  const runStartTime = new Date()

  try {
    const affiliateId = await getAffiliateId()
    const result = await ingestSource(source, affiliateId)

    await db.insert(cronLogs).values({
      runAt: runStartTime,
      sourceName: source.name,
      coursesAdded: result.added,
      coursesExpired: 0,
      errorMessage: result.errors.length > 0 ? result.errors.join("; ").slice(0, 4000) : null,
      status: result.errors.length > 0 && result.added === 0 ? "partial" : "success",
    })

    await logAuditEvent("update", "rss_sources", id, {
      manualFetch: true,
      name: source.name,
      coursesAdded: result.added,
      itemErrors: result.errors.length,
    })

    revalidatePath("/admin/sources")
    revalidatePath("/admin/courses")
    revalidatePath("/admin/logs")
    revalidatePath("/")
    return { error: null, added: result.added, itemErrors: result.errors.length }
  } catch (err) {
    try {
      await db.insert(cronLogs).values({
        runAt: runStartTime,
        sourceName: source.name,
        coursesAdded: 0,
        coursesExpired: 0,
        errorMessage: String(err).slice(0, 4000),
        status: "fail",
      })
    } catch (logErr) {
      console.error("[admin] Failed to write cron log for manual fetch:", logErr)
    }

    revalidatePath("/admin/sources")
    revalidatePath("/admin/logs")
    return { error: `Fetch failed: ${String(err)}`.slice(0, 300) }
  }
}

export async function deleteSource(id: number): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }
  if (!Number.isInteger(id) || id <= 0) return { error: "Invalid source id" }

  const existing = await db.query.rssSources.findFirst({
    where: eq(rssSources.id, id),
    columns: { id: true, name: true, url: true },
  })
  if (!existing) return { error: "Source not found" }

  await db.delete(rssSources).where(eq(rssSources.id, id))

  await logAuditEvent("delete", "rss_sources", id, { name: existing.name, url: existing.url })
  revalidatePath("/admin/sources")
  return { error: null }
}
