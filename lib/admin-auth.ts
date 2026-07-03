import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { db } from "./db"
import { settings } from "./schema"
import { eq } from "drizzle-orm"
import { checkRateLimit } from "./rate-limit"
import { getSession, hasSessionSecret } from "./session"

/**
 * Resolve the active admin password hash.
 * The hash stored in the settings table (set via "change password") takes
 * precedence; the ADMIN_PASSWORD_HASH env var is the bootstrap fallback.
 */
async function getActiveHash(): Promise<string | null> {
  try {
    const rows = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "admin_password_hash"))
      .limit(1)
    if (rows[0]?.value) return rows[0].value
  } catch {
    // fall through to env
  }
  return process.env.ADMIN_PASSWORD_HASH ?? null
}

/**
 * Verify the admin password. Refuses to authenticate when critical
 * secrets are missing.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  if (!hasSessionSecret()) {
    console.error("[admin-auth] IRON_SESSION_SECRET not configured — refusing login")
    return false
  }
  const hash = await getActiveHash()
  if (!hash) {
    console.error("[admin-auth] No admin password hash configured — refusing login")
    return false
  }
  try {
    return await bcrypt.compare(password, hash)
  } catch {
    return false
  }
}

/**
 * Server-side auth guard for admin server actions and route handlers.
 * Defense in depth: middleware already gates /admin routes, but every
 * mutation re-verifies the session server-side.
 */
export async function requireAdmin(): Promise<void> {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect("/admin/login")
  }
}

/** Login rate limit: 5 attempts per 15 minutes per IP (sliding window). */
export async function checkLoginRateLimit(ip: string): Promise<boolean> {
  return checkRateLimit(`admin-login:${ip}`, 5, 15 * 60)
}
