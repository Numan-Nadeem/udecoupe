import { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contact Us — Udecoupe",
  description: "Have feedback or questions? Get in touch with the Udecoupe team.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg border border-border bg-card p-8">
            <ContactForm />
          </div>

          {/* Info */}
          <div className="space-y-4 rounded-lg bg-secondary/50 p-6 text-center">
            <p className="text-muted-foreground">
              We typically respond to messages within 24–48 hours during business days.
            </p>
            <p className="text-sm text-muted-foreground">
              For urgent issues, you can also email us directly at{" "}
              <span className="font-medium text-foreground">support@udecoupe.com</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
