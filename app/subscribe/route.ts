import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { db } from "@/lib/db"
import { subscribers } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  email: z.string().email().max(254),
  honeypot: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid request", status: "error" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please enter a valid email address.", status: "error" },
      { status: 400 },
    )
  }

  const { email, honeypot } = parsed.data

  // Honeypot filled -> silently accept and discard (bot)
  if (honeypot && honeypot.trim().length > 0) {
    return NextResponse.json({ message: "Check your email for a verification link.", status: "ok" })
  }

  // Rate limit: 3 subscribe attempts per IP per hour
  const ip = getClientIp(req.headers)
  const allowed = await checkRateLimit(`subscribe:${ip}`, 3, 60 * 60)
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later.", status: "error" },
      { status: 429 },
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const existing = await db.query.subscribers.findFirst({
      where: eq(subscribers.email, normalizedEmail),
    })

    if (existing?.isVerified) {
      return NextResponse.json({ message: "You're already subscribed!", status: "ok" })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const unsubscribeToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    if (existing) {
      await db
        .update(subscribers)
        .set({ token, tokenExpiresAt })
        .where(eq(subscribers.id, existing.id))
    } else {
      await db.insert(subscribers).values({
        email: normalizedEmail,
        token,
        tokenExpiresAt,
        unsubscribeToken,
        isVerified: false,
      })
    }

    await sendVerificationEmail(normalizedEmail, token)

    return NextResponse.json({
      message: "Almost there! Check your email for a verification link.",
      status: "ok",
    })
  } catch (err) {
    console.error("[v0] subscribe failed:", err)
    return NextResponse.json(
      { message: "Something went wrong. Please try again.", status: "error" },
      { status: 500 },
    )
  }
}
