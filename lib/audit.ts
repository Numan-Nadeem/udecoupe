import crypto from "crypto"
import { headers } from "next/headers"
import { db } from "./db"
import { adminAuditLogs } from "./schema"
import { getClientIp } from "./ip"

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"
  | "login"
  | "bulk_update"
export type AuditEntity = "courses" | "subscribers" | "settings" | "rss_sources" | "auth"

/**
 * Audit IP hashing uses a stable (non-rotating) salt so admin actions can be
 * correlated over time, unlike the public click hashing which rotates daily.
 */
function hashAuditIp(ip: string): string {
  const salt = process.env.AUDIT_SALT || process.env.DAILY_SALT || "audit"
  return crypto.createHash("sha256").update(ip + salt).digest("hex")
}

/**
 * Write an audit log row. Never throws — an audit failure must not break the
 * admin mutation itself (but it is logged loudly for observability).
 */
export async function logAuditEvent(
  action: AuditAction,
  entity: AuditEntity,
  entityId: number | null,
  changedFields: Record<string, unknown>,
): Promise<void> {
  try {
    const hdrs = await headers()
    const ip = getClientIp(hdrs)
    await db.insert(adminAuditLogs).values({
      action,
      entity,
      entityId,
      changedFields,
      ipHash: hashAuditIp(ip),
      performedAt: new Date(),
    })
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err)
  }
}
