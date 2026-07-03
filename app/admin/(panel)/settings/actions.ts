"use server"

import { z } from "zod"
import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { settings } from "@/lib/schema"
import { requireAdmin } from "@/lib/session"
import { logAuditEvent } from "@/lib/audit"

const settingsSchema = z.object({
  affiliateId: z
    .string()
    .trim()
    .max(500)
    // URL-safe characters only (an ID or a full tracking URL) — blocks quotes,
    // angle brackets, and whitespace to keep the value injection-safe.
    .regex(/^[a-zA-Z0-9_\-./:?=&%~+]*$/, "Affiliate ID contains invalid characters")
    .optional()
    .or(z.literal("")),
  couponTtlDays: z.coerce.number().int().min(1, "TTL must be at least 1 day").max(30, "TTL cannot exceed 30 days"),
  digestEnabled: z.boolean(),
})

export async function updateSettings(formData: FormData): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const parsed = settingsSchema.safeParse({
    affiliateId: formData.get("affiliateId") ?? "",
    couponTtlDays: formData.get("couponTtlDays"),
    digestEnabled: formData.get("digestEnabled") === "on",
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const values: Record<string, string> = {
    affiliate_id: parsed.data.affiliateId ?? "",
    default_coupon_ttl_days: String(parsed.data.couponTtlDays),
    email_digest_enabled: parsed.data.digestEnabled ? "true" : "false",
  }

  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: sql`excluded.value` },
      })
  }

  await logAuditEvent("update", "settings", null, {
    affiliate_id: values.affiliate_id ? "***set***" : "(empty)",
    default_coupon_ttl_days: values.default_coupon_ttl_days,
    email_digest_enabled: values.email_digest_enabled,
  })

  revalidatePath("/admin/settings")
  revalidatePath("/")
  return { error: null }
}
