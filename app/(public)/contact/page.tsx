import { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contact Us — Udecoupe",
  description: "Have feedback or questions? Get in touch with the Udecoupe team.",
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background texture and glow */}
      <div className="bg-grid mask-fade-edges pointer-events-none fixed inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none fixed -right-32 -top-40 h-[480px] w-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Support
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
              Get in Touch
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-[2rem] border border-border bg-secondary/50 p-1.5">
            <div className="rounded-[calc(2rem-0.375rem)] bg-card p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <ContactForm />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 rounded-2xl border border-primary/25 bg-primary/8 p-6 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We typically respond to messages within 24–48 hours during business days.
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Or email us directly at{" "}
              <span className="font-semibold text-primary">support@udecoupe.com</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
