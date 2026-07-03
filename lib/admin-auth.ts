import bcrypt from "bcryptjs"
import { checkRateLimit } from "./rate-limit"
import { hasSessionSecret } from "./session"

/**
 * Verify the admin password against the bcrypt hash in env.
 * Refuses to authenticate when critical secrets are missing.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash || !hasSessionSecret()) {
    console.error(
      "[admin-auth] ADMIN_PASSWORD_HASH or IRON_SESSION_SECRET not configured — refusing login",
    )
    return false
  }
  try {
    return await bcrypt.compare(password, hash)
  } catch {
    return false
  }
}

/** Login rate limit: 5 attempts per 15 minutes per IP (sliding window). */
export async function checkLoginRateLimit(ip: string): Promise<boolean> {
  return checkRateLimit(`admin-login:${ip}`, 5, 15 * 60)
}
