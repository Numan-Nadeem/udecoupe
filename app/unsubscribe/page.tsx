import type { Metadata } from "next"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { subscribers } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { StatusPage } from "@/components/status-page"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } }

const tokenSchema = /^[a-f0-9]{64}$/

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  // Generic confirmation either way — never reveal whether an email exists
  const genericSuccess = (
    <StatusPage
      variant="success"
      title="You've been unsubscribed"
      message="You won't receive any more emails from us. You can re-subscribe anytime from the homepage."
    />
  )

  if (!token || !tokenSchema.test(token)) {
    return genericSuccess
  }

  const ip = getClientIp(await headers())
  const allowed = await checkRateLimit(`unsubscribe:${ip}`, 5, 60 * 60)
  if (!allowed) {
    return (
      <StatusPage
        variant="error"
        title="Too many attempts"
        message="Please wait a little while before trying again."
      />
    )
  }

  try {
    const subscriber = await db.query.subscribers.findFirst({
      where: eq(subscribers.unsubscribeToken, token),
    })
    if (subscriber) {
      await db.delete(subscribers).where(eq(subscribers.id, subscriber.id))
    }
  } catch (err) {
    console.error("[v0] unsubscribe failed:", err)
  }

  return genericSuccess
}
