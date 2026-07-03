"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { settings } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin-auth"
import { logAudit } from "@/lib/audit"

const settingsSchema = z.object({
  affiliateId: z.string().trim().max(120).optional().or(z.literal("")),
  digestEnabled: z.enum(["true", "false"]),
  digestHourUtc: z.coerce.number().int().min(0).max(23),
})

export type SettingsFormState = {
  error?: string
  success?: boolean
}

async function upsertSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
}

export async function saveSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin()

  const parsed = settingsSchema.safeParse({
    affiliateId: formData.get("affiliateId"),
    digestEnabled: formData.get("digestEnabled"),
    digestHourUtc: formData.get("digestHourUtc"),
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  await Promise.all([
    upsertSetting("affiliate_id", parsed.data.affiliateId ?? ""),
    upsertSetting("digest_enabled", parsed.data.digestEnabled),
    upsertSetting("digest_hour_utc", String(parsed.data.digestHourUtc)),
  ])

  await logAudit({
    action: "update",
    entity: "settings",
    changedFields: {
      affiliate_id: parsed.data.affiliateId ?? "",
      digest_enabled: parsed.data.digestEnabled,
      digest_hour_utc: parsed.data.digestHourUtc,
    },
  })

  revalidatePath("/admin/settings")
  return { success: true }
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(200),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters")
      .max(200)
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string().min(1).max(200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type PasswordFormState = {
  error?: string
  success?: boolean
}

export async function changePassword(_prev: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  await requireAdmin()

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const rows = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, "admin_password_hash")).limit(1)
  const storedHash = rows[0]?.value

  if (!storedHash) {
    return { error: "Password change is unavailable: no password hash is set in the database" }
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, storedHash)
  if (!valid) {
    return { error: "Current password is incorrect" }
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await upsertSetting("admin_password_hash", newHash)

  await logAudit({
    action: "update",
    entity: "settings",
    changedFields: { admin_password_hash: "[rotated]" },
  })

  revalidatePath("/admin/settings")
  return { success: true }
}
