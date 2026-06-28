import type { Metadata } from "next"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { subscribers } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { StatusPage } from "@/components/status-page"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Verify subscription", robots: { index: false } }

const tokenSchema = /^[a-f0-9]{64}$/

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token || !tokenSchema.test(token)) {
    return (
      <StatusPage
        variant="error"
        title="Invalid verification link"
        message="This link doesn't look right. Please use the link from your verification email, or subscribe again."
      />
    )
  }

  // Rate limit verification attempts: 10 per IP per hour
  const ip = getClientIp(await headers())
  const allowed = await checkRateLimit(`verify:${ip}`, 10, 60 * 60)
  if (!allowed) {
    return (
      <StatusPage
        variant="error"
        title="Too many attempts"
        message="You've tried to verify too many times. Please wait a little while and try again."
      />
    )
  }

  try {
    const subscriber = await db.query.subscribers.findFirst({
      where: eq(subscribers.token, token),
    })

    if (!subscriber) {
      return (
        <StatusPage
          variant="error"
          title="Verification link not found"
          message="This link is invalid or has already been used. Try subscribing again to receive a fresh link."
        />
      )
    }

    if (subscriber.tokenExpiresAt && subscriber.tokenExpiresAt.getTime() < Date.now()) {
      return (
        <StatusPage
          variant="error"
          title="This link has expired"
          message="Verification links are valid for 24 hours. Please subscribe again to get a new one."
        />
      )
    }

    await db
      .update(subscribers)
      .set({ isVerified: true, token: null, tokenExpiresAt: null })
      .where(eq(subscribers.id, subscriber.id))

    return (
      <StatusPage
        variant="success"
        title="You're all set!"
        message="Your email is verified. You'll now receive a daily digest of new free Udemy courses with active coupons."
      />
    )
  } catch (err) {
    console.error("[v0] verify failed:", err)
    return (
      <StatusPage
        variant="error"
        title="Something went wrong"
        message="We couldn't verify your subscription right now. Please try again in a few minutes."
      />
    )
  }
}
