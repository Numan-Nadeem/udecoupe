import { type NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { db } from "@/lib/db"
import { courses, rssSources, cronLogs } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { fetchRssFeed } from "@/lib/rss-parser"
import { enrichCourse, type EnrichedData } from "@/lib/enrichment"
import { buildAffiliateUrl, getAffiliateId } from "@/lib/affiliate"
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "course"
  let candidate = base
  let counter = 2
  // Suffix counter on collision: course-title, course-title-2, ...
  while (true) {
    const existing = await db.query.courses.findFirst({
      where: eq(courses.slug, candidate),
      columns: { id: true },
    })
    if (!existing) return candidate
    candidate = `${base}-${counter}`
    counter++
    if (counter > 500) {
      // Safety valve — practically unreachable
      return `${base}-${Date.now()}`
    }
  }
}

function extractCouponCode(url: string): string {
  try {
    const u = new URL(url)
    return u.searchParams.get("couponCode") || u.searchParams.get("couponcode") || "UNKNOWN"
  } catch {
    return "UNKNOWN"
  }
}

const DEFAULT_COUPON_TTL_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const MAX_ITEMS_PER_SOURCE = 50

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
        const feedData = await fetchRssFeed(source.url)

        for (const item of feedData.items.slice(0, MAX_ITEMS_PER_SOURCE)) {
          try {
            // Deduplicate by coupon_url
            const existing = await db.query.courses.findFirst({
              where: eq(courses.couponUrl, item.couponUrl),
              columns: { id: true },
            })
            if (existing) continue

            // AI enrichment — failure must not block insertion
            let enriched: EnrichedData
            try {
              enriched = await enrichCourse({
                title: item.title,
                description: item.description,
                instructor: item.instructor,
              })
            } catch (err) {
              enriched = {
                category: item.category || "Uncategorized",
                difficulty: "Unknown",
                descriptionEnriched: item.description,
                isFlagged: true,
                flagReason: `Enrichment failed: ${String(err)}`.slice(0, 500),
              }
            }

            const slug = await generateUniqueSlug(item.title)
            const affiliateUrl = buildAffiliateUrl(item.couponUrl, affiliateId)

            await db.insert(courses).values({
              title: item.title.slice(0, 500),
              slug,
              description: item.description.slice(0, 5000),
              descriptionEnriched: enriched.descriptionEnriched?.slice(0, 5000) || null,
              instructor: item.instructor?.slice(0, 200) || null,
              category: enriched.category.slice(0, 100),
              difficulty: enriched.difficulty,
              thumbnailUrl: item.thumbnail?.startsWith("http") ? item.thumbnail.slice(0, 1000) : null,
              rating: null,
              totalStudents: null,
              couponCode: extractCouponCode(item.couponUrl).slice(0, 100),
              couponUrl: item.couponUrl,
              affiliateUrl,
              expiresAt: new Date(Date.now() + DEFAULT_COUPON_TTL_MS),
              isActive: !enriched.isFlagged, // Flagged courses start inactive
              isFlagged: enriched.isFlagged,
              flagReason: enriched.flagReason,
              source: "rss",
              rssSourceName: source.name,
            })

            totalAdded++
          } catch (itemErr) {
            errors.push(`Item "${item.title.slice(0, 60)}": ${String(itemErr)}`.slice(0, 300))
          }
        }

        // Source succeeded: update metadata and reset fail count
        await db
          .update(rssSources)
          .set({ lastFetchedAt: new Date(), failCount: 0 })
          .where(eq(rssSources.id, source.id))
      } catch (sourceErr) {
        // Source fetch failed: increment fail count, auto-disable at 5
        const failCount = (source.failCount ?? 0) + 1
        await db
          .update(rssSources)
          .set({
            failCount,
            isActive: failCount >= 5 ? false : source.isActive,
          })
          .where(eq(rssSources.id, source.id))

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
