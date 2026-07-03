import { db } from "./db"
import { courses, rssSources } from "./schema"
import { eq } from "drizzle-orm"
import { or } from "drizzle-orm"
import { fetchRssFeed } from "./rss-parser"
import { enrichCourse, type EnrichedData } from "./enrichment"
import { buildAffiliateUrl } from "./affiliate"
import { resolveCouponLink } from "./coupon-resolver"

export type IngestSource = {
  id: number
  name: string
  url: string
  isActive: boolean | null
  failCount: number | null
}

export type IngestResult = {
  added: number
  flagged: number
  skipped: number
  errors: string[]
}

export type IngestProgressEvent =
  | { type: "status"; message: string }
  | { type: "feed"; total: number }
  | {
      type: "item"
      index: number
      total: number
      title: string
      status: "duplicate" | "resolving" | "enriching" | "added" | "flagged" | "error"
      detail?: string
    }

export type IngestProgressCallback = (event: IngestProgressEvent) => void | Promise<void>

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

/**
 * Fetches one RSS source, enriches and inserts new courses, and updates the
 * source's fetch metadata (last_fetched_at / fail_count, auto-disable at 5
 * consecutive failures).
 *
 * Throws only if the feed itself cannot be fetched/parsed — individual item
 * failures are collected into `errors` and never abort the run.
 */
export async function ingestSource(
  source: IngestSource,
  affiliateId: string | null,
  onProgress?: IngestProgressCallback,
): Promise<IngestResult> {
  let added = 0
  let flagged = 0
  let skipped = 0
  const errors: string[] = []

  try {
    await onProgress?.({ type: "status", message: `Fetching feed "${source.name}"...` })
    const feedData = await fetchRssFeed(source.url)
    const items = feedData.items.slice(0, MAX_ITEMS_PER_SOURCE)
    const total = items.length
    await onProgress?.({ type: "feed", total })

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const index = i + 1
      try {
        // Cheap dedupe first: match on the original feed link or stored coupon URL
        const existing = await db.query.courses.findFirst({
          where: or(eq(courses.feedItemUrl, item.couponUrl), eq(courses.couponUrl, item.couponUrl)),
          columns: { id: true },
        })
        if (existing) {
          skipped++
          await onProgress?.({ type: "item", index, total, title: item.title, status: "duplicate" })
          continue
        }

        // Resolve the RSS link to the real Udemy URL + coupon code.
        // Third-party pages (coursevania, freebiesglobal, ...) are fetched and
        // scanned for udemy.com/course links carrying a couponCode.
        await onProgress?.({ type: "item", index, total, title: item.title, status: "resolving" })
        const resolved = await resolveCouponLink(item.couponUrl)

        if (!resolved) {
          errors.push(`Item "${item.title.slice(0, 60)}": no Udemy link found on ${item.couponUrl}`.slice(0, 300))
          await onProgress?.({
            type: "item",
            index,
            total,
            title: item.title,
            status: "error",
            detail: "No Udemy course link found on the linked page — skipped",
          })
          continue
        }

        // Dedupe again on the resolved Udemy URL (same course posted by many aggregators)
        const existingResolved = await db.query.courses.findFirst({
          where: eq(courses.couponUrl, resolved.udemyUrl),
          columns: { id: true },
        })
        if (existingResolved) {
          skipped++
          await onProgress?.({ type: "item", index, total, title: item.title, status: "duplicate" })
          continue
        }

        await onProgress?.({ type: "item", index, total, title: item.title, status: "enriching" })

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
        const affiliateUrl = buildAffiliateUrl(resolved.udemyUrl, affiliateId)

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
          couponCode: (resolved.couponCode || "UNKNOWN").slice(0, 100),
          couponUrl: resolved.udemyUrl,
          feedItemUrl: item.couponUrl.slice(0, 2000),
          affiliateUrl,
          expiresAt: new Date(Date.now() + DEFAULT_COUPON_TTL_MS),
          isActive: !enriched.isFlagged, // Flagged courses start inactive
          isFlagged: enriched.isFlagged,
          flagReason: enriched.flagReason,
          source: "rss",
          rssSourceName: source.name,
        })

        added++
        if (enriched.isFlagged) {
          flagged++
          await onProgress?.({
            type: "item",
            index,
            total,
            title: item.title,
            status: "flagged",
            detail: enriched.flagReason || undefined,
          })
        } else {
          await onProgress?.({ type: "item", index, total, title: item.title, status: "added" })
        }
      } catch (itemErr) {
        errors.push(`Item "${item.title.slice(0, 60)}": ${String(itemErr)}`.slice(0, 300))
        await onProgress?.({
          type: "item",
          index,
          total,
          title: item.title,
          status: "error",
          detail: String(itemErr).slice(0, 200),
        })
      }
    }

    // Source succeeded: update metadata and reset fail count
    await db
      .update(rssSources)
      .set({ lastFetchedAt: new Date(), failCount: 0 })
      .where(eq(rssSources.id, source.id))

    return { added, flagged, skipped, errors }
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
