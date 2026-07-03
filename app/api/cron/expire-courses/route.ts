import { type NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { db } from "@/lib/db"
import { courses, cronLogs } from "@/lib/schema"
import { and, eq, gte, lt } from "drizzle-orm"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** Timing-safe comparison of the Authorization header against CRON_SECRET. */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get("authorization") || ""
  const expected = `Bearer ${secret}`
  const headerBuf = Buffer.from(header)
  const expectedBuf = Buffer.from(expected)
  if (headerBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(headerBuf, expectedBuf)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const runStartTime = new Date()

  try {
    // Deactivate courses past their expiry date
    const expired = await db
      .update(courses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(lt(courses.expiresAt, new Date()), eq(courses.isActive, true)))
      .returning({ id: courses.id })

    const expiredCount = expired.length

    // Flag courses with 3+ expired reports that aren't already flagged
    const flagged = await db
      .update(courses)
      .set({
        isFlagged: true,
        flagReason: "Too many expired reports",
        updatedAt: new Date(),
      })
      .where(and(gte(courses.expiredReports, 3), eq(courses.isFlagged, false)))
      .returning({ id: courses.id })

    const flaggedCount = flagged.length

    await db.insert(cronLogs).values({
      runAt: runStartTime,
      sourceName: "expiry",
      coursesAdded: 0,
      coursesExpired: expiredCount,
      errorMessage: null,
      status: "success",
    })

    return NextResponse.json({
      success: true,
      expiredCount,
      flaggedCount,
    })
  } catch (err) {
    try {
      await db.insert(cronLogs).values({
        runAt: runStartTime,
        sourceName: "expiry",
        coursesAdded: 0,
        coursesExpired: 0,
        errorMessage: String(err).slice(0, 4000),
        status: "fail",
      })
    } catch (logErr) {
      console.error("[cron] Failed to write cron log:", logErr)
    }

    return NextResponse.json({ error: "Expiry job failed" }, { status: 500 })
  }
}
