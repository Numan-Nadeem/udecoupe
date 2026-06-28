"use server"

import { headers } from "next/headers"
import { incrementExpiredReports } from "@/lib/queries"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

export async function reportExpiredAction(courseId: number) {
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return { ok: false }
  }

  const ip = getClientIp(await headers())
  // Max 10 reports per IP per hour to prevent abuse
  const allowed = await checkRateLimit(`report:${ip}`, 10, 60 * 60)
  if (!allowed) {
    return { ok: false, rateLimited: true }
  }

  try {
    await incrementExpiredReports(courseId)
    return { ok: true }
  } catch (err) {
    console.error("[v0] reportExpiredAction failed:", err)
    return { ok: false }
  }
}
