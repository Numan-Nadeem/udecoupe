import { Resend } from "resend"
import { db } from "./db"
import { subscribers, courses } from "./schema"
import { and, desc, eq, gt } from "drizzle-orm"

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

let resend: Resend | null | undefined = undefined
function getResend(): Resend | null {
  if (resend !== undefined) return resend
  if (!resendApiKey) {
    resend = null
    return null
  }
  try {
    resend = new Resend(resendApiKey)
    return resend
  } catch (e) {
    console.warn("[email] Failed to initialize Resend:", e)
    resend = null
    return null
  }
}

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const client = getResend()
  const verifyUrl = `${baseUrl()}/verify?token=${token}`

  if (!client) {
    console.log(`[v0] (email disabled) Verification link for ${email}: ${verifyUrl}`)
    return
  }

  await client.emails.send({
    from: fromEmail,
    to: email,
    subject: "Verify your Udecoupe subscription",
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <p style="font-size: 18px; font-weight: 800; color: #3a2f9e; margin: 0 0 16px;">Udecoupe</p>
        <h2 style="color: #111827; margin-bottom: 8px;">Confirm your subscription</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Verify your email to start receiving daily digests of free Udemy courses with active coupons.
        </p>
        <a href="${verifyUrl}"
          style="display: inline-block; background: #3a2f9e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
          This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

/** Escape HTML special characters to prevent injection in email content. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const DIGEST_BATCH_SIZE = 50

/**
 * Sends a digest email to all verified subscribers featuring courses added
 * in the last 6 hours (max 5). Called by the fetch-coupons cron after a
 * successful run that added at least one course.
 *
 * Errors on individual sends are logged and skipped — a failed send never
 * blocks the rest of the batch.
 */
export async function triggerDigestEmail(): Promise<{ sent: number; failed: number }> {
  const client = getResend()
  const site = baseUrl()

  const verifiedSubscribers = await db.query.subscribers.findMany({
    where: eq(subscribers.isVerified, true),
    columns: { email: true, unsubscribeToken: true },
  })

  if (verifiedSubscribers.length === 0) return { sent: 0, failed: 0 }

  // Window matches the cron cadence (daily on Vercel Hobby plan).
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const newCourses = await db.query.courses.findMany({
    where: and(gt(courses.createdAt, oneDayAgo), eq(courses.isActive, true)),
    orderBy: [desc(courses.createdAt)],
    limit: 5,
    columns: {
      title: true,
      slug: true,
      category: true,
      difficulty: true,
      expiresAt: true,
    },
  })

  if (newCourses.length === 0) return { sent: 0, failed: 0 }

  const courseList = newCourses
    .map((course) => {
      const daysLeft = course.expiresAt
        ? Math.max(1, Math.ceil((course.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
        : null
      return `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
      <h3 style="margin: 0 0 8px 0; color: #111827;">${escapeHtml(course.title)}</h3>
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">
        ${escapeHtml(course.category || "General")} &bull; ${escapeHtml(course.difficulty || "All levels")}
      </p>
      ${daysLeft !== null ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</p>` : ""}
      <a href="${site}/go/${encodeURIComponent(course.slug)}" style="display: inline-block; padding: 10px 20px; background-color: #3a2f9e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Get Free Course
      </a>
    </div>`
    })
    .join("")

  const subject = `${newCourses.length} new free Udemy course${newCourses.length === 1 ? "" : "s"} on Udecoupe`

  const buildHtml = (unsubscribeToken: string) => `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 18px; font-weight: 800; color: #3a2f9e; margin: 0 0 16px;">Udecoupe</p>
    <h2 style="margin-bottom: 16px; color: #111827;">${newCourses.length} new free course${newCourses.length === 1 ? "" : "s"} just landed</h2>
    <p style="margin-bottom: 20px; color: #666; line-height: 1.6;">We found new courses with active coupons. Grab them while they're free!</p>
    ${courseList}
    <p style="margin-top: 30px; font-size: 12px; color: #999;">
      <a href="${site}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}" style="color: #3a2f9e; text-decoration: none;">
        Unsubscribe
      </a>
    </p>
  </div>`

  if (!client) {
    console.log(
      `[v0] (email disabled) Would send digest of ${newCourses.length} courses to ${verifiedSubscribers.length} subscribers`,
    )
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (let i = 0; i < verifiedSubscribers.length; i += DIGEST_BATCH_SIZE) {
    const batch = verifiedSubscribers.slice(i, i + DIGEST_BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((subscriber) =>
        client.emails.send({
          from: fromEmail,
          to: subscriber.email,
          subject,
          html: buildHtml(subscriber.unsubscribeToken),
        }),
      ),
    )
    for (const result of results) {
      if (result.status === "fulfilled" && !result.value.error) {
        sent++
      } else {
        failed++
        const reason =
          result.status === "rejected" ? result.reason : result.value.error?.message
        console.error("[email] Digest send failed:", reason)
      }
    }
  }

  return { sent, failed }
}
