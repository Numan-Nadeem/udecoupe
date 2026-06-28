import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courses } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { logCourseClick } from "@/lib/queries"
import { buildAffiliateUrl, getAffiliateId } from "@/lib/affiliate"
import { hashIp, getClientIp } from "@/lib/ip"
import { isBot } from "@/lib/bot-detect"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  // Basic slug validation
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return new NextResponse("Not found", { status: 404 })
  }

  const userAgent = req.headers.get("user-agent") || ""
  const ip = getClientIp(req.headers)

  // Rate limit: 30 redirects per IP per minute
  const allowed = await checkRateLimit(`go:${ip}`, 30, 60)
  if (!allowed) {
    return new NextResponse("Too many requests", { status: 429 })
  }

  let course
  try {
    course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    })
  } catch (err) {
    console.error("[v0] /go lookup failed:", err)
    return new NextResponse("Service unavailable", { status: 503 })
  }

  if (!course) {
    return new NextResponse("Course not found", { status: 404 })
  }

  if (!course.isActive) {
    return new NextResponse("This coupon has expired", { status: 410 })
  }

  // Determine destination URL (fallback used even if logging fails)
  let destination = course.couponUrl
  try {
    if (course.affiliateUrl) {
      destination = course.affiliateUrl
    } else {
      const affiliateId = await getAffiliateId()
      destination = buildAffiliateUrl(course.couponUrl, affiliateId || null)
    }
  } catch (err) {
    console.error("[v0] affiliate url build failed:", err)
    destination = course.couponUrl
  }

  // Log click only for real users, never block the redirect on logging
  if (!isBot(userAgent)) {
    try {
      await logCourseClick(course.id, hashIp(ip), userAgent.slice(0, 500), course.category)
    } catch (err) {
      console.error("[v0] click logging failed:", err)
    }
  }

  return NextResponse.redirect(destination, 302)
}
