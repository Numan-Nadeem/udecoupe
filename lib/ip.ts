import crypto from "crypto"

const FALLBACK_SALT = process.env.DAILY_SALT || "udecoupe-fallback-salt"

/**
 * Derive a daily-rotating salt. Combines the configured DAILY_SALT with the
 * current UTC date so the effective salt rotates every day even if the env
 * var itself is not rotated.
 */
function getDailySalt(): string {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)
  return `${FALLBACK_SALT}:${today}`
}

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + getDailySalt()).digest("hex")
}

/**
 * Extract the client IP from the incoming request headers. Vercel/proxies
 * forward the real client IP in x-forwarded-for (comma separated list).
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return headers.get("x-real-ip") || "0.0.0.0"
}
