"use server"

import { z } from "zod"
import { sendEmail } from "@/lib/email"

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(10).max(5000),
})

export async function submitContact(formData: unknown): Promise<{ error?: string; success?: boolean }> {
  const parsed = contactSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: "Invalid form data" }
  }

  const { name, email, subject, message } = parsed.data

  try {
    // Email to admin
    await sendEmail({
      to: "contact@udecoupe.com",
      subject: `[Udecoupe Contact] ${subject}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, "<br />\n")}</p>
      `,
    })

    // Reply to user
    await sendEmail({
      to: email,
      subject: "We received your message — Udecoupe",
      html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for reaching out to Udecoupe. We received your message and will get back to you as soon as possible.</p>
        <p>Your message:</p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin: 1em 0;">
          <p><strong>${escapeHtml(subject)}</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br />\n")}</p>
        </blockquote>
        <p>Best regards,<br />Udecoupe Team</p>
      `,
    })

    return { success: true }
  } catch (err) {
    console.error("[contact] Email send failed:", err)
    return { error: "Failed to send message. Please try again later." }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
