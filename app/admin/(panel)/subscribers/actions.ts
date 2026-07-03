"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { subscribers } from "@/lib/schema"
import { requireAdmin } from "@/lib/session"
import { logAuditEvent } from "@/lib/audit"

export async function deleteSubscriber(id: number): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }
  if (!Number.isInteger(id) || id <= 0) return { error: "Invalid subscriber id" }

  const existing = await db.query.subscribers.findFirst({
    where: eq(subscribers.id, id),
    columns: { id: true, email: true, isVerified: true },
  })
  if (!existing) return { error: "Subscriber not found" }

  await db.delete(subscribers).where(eq(subscribers.id, id))

  // Do not log the raw email in the audit trail; log a redacted form.
  const [local, domain] = existing.email.split("@")
  await logAuditEvent("delete", "subscribers", id, {
    email: `${local?.slice(0, 2) ?? ""}***@${domain ?? ""}`,
    wasVerified: existing.isVerified,
  })

  revalidatePath("/admin/subscribers")
  return { error: null }
}
