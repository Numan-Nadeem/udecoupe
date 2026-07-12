"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { and, eq, gt, isNull } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { adminPasswordResets } from "@/lib/schema"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
import { getClientIp } from "@/lib/ip"

/** The one email address that may receive a reset link. */
const OWNER_EMAIL = "noman.mughal256@gmail.com"

/** Rate limit: 3 reset requests per IP per hour. */
async function checkResetRateLimit(ip: string): Promise<boolean> {
  return checkRateLimit(`admin-reset:${ip}`, 3, 60 * 60)
}

export interface ForgotPasswordState {
  error: string | null
  success: boolean
}

export async function requestResetAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

  const hdrs = await headers()
  const ip = getClientIp(hdrs)

  const allowed = await checkResetRateLimit(ip)
  if (!allowed) {
    return { error: "Too many requests. Try again later.", success: false }
  }

  // Always return the same success message regardless of whether the email
  // matches — prevents email enumeration.
  if (email !== OWNER_EMAIL) {
    return { error: null, success: true }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"

  // Generate a cryptographically random token, hash it before storing.
  const rawToken = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Invalidate any unused existing tokens for this owner before inserting.
  await db.delete(adminPasswordResets).where(isNull(adminPasswordResets.usedAt))

  await db.insert(adminPasswordResets).values({ tokenHash, expiresAt })

  const resetUrl = `${baseUrl}/admin/reset-password?token=${rawToken}`

  await sendEmail({
    to: OWNER_EMAIL,
    subject: "Udecoupe Admin — Password Reset",
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <p style="font-size:18px;font-weight:800;color:#3a2f9e;margin:0 0 16px">Udecoupe Admin</p>
        <h2 style="margin:0 0 12px;color:#111">Reset your admin password</h2>
        <p style="color:#555;line-height:1.6">Click the button below to set a new password. This link expires in <strong>15 minutes</strong> and can only be used once.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#3a2f9e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px">If you did not request this, you can safely ignore this email. Your password will not change.</p>
        <p style="color:#bbb;font-size:12px;margin-top:24px">This link expires at ${expiresAt.toUTCString()}</p>
      </div>
    `,
  })

  return { error: null, success: true }
}

// ---------------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------------

const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(12).max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  })

export interface ResetPasswordState {
  error: string | null
  success: boolean
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  })

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input."
    return { error: msg, success: false }
  }

  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex")

  const row = await db.query.adminPasswordResets.findFirst({
    where: and(
      eq(adminPasswordResets.tokenHash, tokenHash),
      isNull(adminPasswordResets.usedAt),
      gt(adminPasswordResets.expiresAt, new Date()),
    ),
  })

  if (!row) {
    return { error: "This reset link is invalid or has expired.", success: false }
  }

  // Hash the new password and update the env — in this deployment model the
  // hash is stored as an env var set outside the app, so we log it clearly for
  // the admin to copy into Vercel settings.
  const newHash = await bcrypt.hash(parsed.data.password, 12)

  // Mark token as used immediately to prevent replay.
  await db
    .update(adminPasswordResets)
    .set({ usedAt: new Date() })
    .where(eq(adminPasswordResets.id, row.id))

  // Email the new hash to the owner so they can paste it into Vercel env vars.
  await sendEmail({
    to: OWNER_EMAIL,
    subject: "Udecoupe Admin — Your New Password Hash",
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <p style="font-size:18px;font-weight:800;color:#3a2f9e;margin:0 0 16px">Udecoupe Admin</p>
        <h2 style="margin:0 0 12px;color:#111">Your new password hash</h2>
        <p style="color:#555;line-height:1.6">Your password was reset. Copy the hash below and set it as the <code>ADMIN_PASSWORD_HASH</code> environment variable in your Vercel project, then redeploy.</p>
        <pre style="background:#f4f4f4;padding:16px;border-radius:8px;word-break:break-all;font-size:13px;margin:20px 0">${newHash}</pre>
        <p style="color:#888;font-size:13px">Steps: Vercel dashboard &rarr; Project Settings &rarr; Environment Variables &rarr; update <code>ADMIN_PASSWORD_HASH</code> &rarr; Redeploy.</p>
        <p style="color:#d00;font-size:13px;margin-top:16px"><strong>Keep this hash private.</strong> Delete this email after updating your settings.</p>
      </div>
    `,
  })

  return { error: null, success: true }
}
