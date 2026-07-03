import { type NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { db } from "@/lib/db"
import { rssSources, cronLogs } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { ingestSource } from "@/lib/ingest"
import { getAffiliateId } from "@/lib/affiliate"
import { triggerDigestEmail } from "@/lib/email"

export const dynamic = "force-dynamic"
export const maxDuration = 300

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
  let totalAdded = 0
  const errors: string[] = []

  try {
    const activeSources = await db.query.rssSources.findMany({
      where: eq(rssSources.isActive, true),
    })

    const affiliateId = await getAffiliateId()

    for (const source of activeSources) {
      try {
        const result = await ingestSource(source, affiliateId)
        totalAdded += result.added
        errors.push(...result.errors)
      } catch (sourceErr) {
        errors.push(`Source ${source.name} failed: ${String(sourceErr)}`.slice(0, 300))
      }
    }

    await db.insert(cronLogs).values({
      runAt: runStartTime,
      sourceName: "all",
      coursesAdded: totalAdded,
      coursesExpired: 0,
      errorMessage: errors.length > 0 ? errors.join("; ").slice(0, 4000) : null,
      status: errors.length > 0 && totalAdded === 0 ? "partial" : "success",
    })

    // Digest email only after a successful run that added at least 1 course
    let digest: { sent: number; failed: number } | undefined
    if (totalAdded > 0) {
      try {
        digest = await triggerDigestEmail()
      } catch (emailErr) {
        console.error("[cron] Digest email failed:", emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      coursesAdded: totalAdded,
      sourcesProcessed: activeSources.length,
      digest,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    try {
      await db.insert(cronLogs).values({
        runAt: runStartTime,
        sourceName: "all",
        coursesAdded: totalAdded,
        coursesExpired: 0,
        errorMessage: String(err).slice(0, 4000),
        status: "fail",
      })
    } catch (logErr) {
      console.error("[cron] Failed to write cron log:", logErr)
    }

    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}
