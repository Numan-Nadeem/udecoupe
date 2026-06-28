import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

let resend: Resend | null = null
function getResend(): Resend | null {
  if (resend) return resend
  if (!resendApiKey) return null
  resend = new Resend(resendApiKey)
  return resend
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
    subject: "Verify your subscription to Free Udemy Courses",
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Confirm your subscription</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Verify your email to start receiving daily digests of free Udemy courses with active coupons.
        </p>
        <a href="${verifyUrl}"
          style="display: inline-block; background: #6d28d9; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
          This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
