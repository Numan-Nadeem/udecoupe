import { db } from "./db"
import { courses, rssSources } from "./schema"
import { eq } from "drizzle-orm"
import { fetchRssFeed } from "./rss-parser"
import { enrichCourse, type EnrichedData } from "./enrichment"
import { buildAffiliateUrl } from "./affiliate"

export type IngestSource = {
  id: number
  name: string
  url: string
  isActive: boolean | null
  failCount: number | null
}

export type IngestResult = {
  added: number
  errors: string[]
}

const DEFAULT_COUPON_TTL_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const MAX_ITEMS_PER_SOURCE = 50

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

/**
 * Fetches one RSS source, enriches and inserts new courses, and updates the
 * source's fetch metadata (last_fetched_at / fail_count, auto-disable at 5
 * consecutive failures).
 *
 * Throws only if the feed itself cannot be fetched/parsed — individual item
 * failures are collected into `errors` and never abort the run.
 */
export async function ingestSource(source: IngestSource, affiliateId: string | null): Promise<IngestResult> {
  let added = 0
  const errors: string[] = []

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

        added++
      } catch (itemErr) {
        errors.push(`Item "${item.title.slice(0, 60)}": ${String(itemErr)}`.slice(0, 300))
      }
    }

    // Source succeeded: update metadata and reset fail count
    await db
      .update(rssSources)
      .set({ lastFetchedAt: new Date(), failCount: 0 })
      .where(eq(rssSources.id, source.id))

    return { added, errors }
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

    throw sourceErr
  }
}
