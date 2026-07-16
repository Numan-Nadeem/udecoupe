"use client"

import { useState, useTransition } from "react"
import { submitContact } from "@/app/(public)/contact/actions"

export function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.currentTarget
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await submitContact(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(true)
        setFormData({ name: "", email: "", subject: "", message: "" })
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          ✓ Message sent! We&apos;ll get back to you soon.
        </p>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Your Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={isPending}
          required
          className="mt-2.5 w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder-muted-foreground/60 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          placeholder="John Doe"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isPending}
          required
          className="mt-2.5 w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder-muted-foreground/60 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          disabled={isPending}
          required
          className="mt-2.5 w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder-muted-foreground/60 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          placeholder="How can we help?"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          disabled={isPending}
          required
          rows={6}
          className="mt-2.5 w-full rounded-2xl border border-border bg-card px-5 py-3 text-foreground placeholder-muted-foreground/60 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          placeholder="Tell us what's on your mind..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="group mt-2 flex w-full items-center justify-center gap-2.5 rounded-full bg-primary py-3 pl-6 pr-2.5 font-semibold text-primary-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Send Message"}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-0.5 group-hover:scale-105">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>

      <p className="text-center text-xs text-muted-foreground">
        We respect your privacy. See our{" "}
        <a href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </a>{" "}
        for details.
      </p>
    </form>
  )
}
