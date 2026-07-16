import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Udecoupe — Free Udemy Courses with Coupon Codes",
  description: "Learn how Udecoupe helps you find free Udemy courses. We use affiliate links to support our service.",
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background texture and glow */}
      <div className="bg-grid mask-fade-edges pointer-events-none fixed inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none fixed -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="space-y-16">
          {/* Header */}
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              About Us
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
              Finding free Udemy courses made simple
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Udecoupe aggregates free Udemy course coupons in one place, saving you time and helping you learn without breaking the bank.
            </p>
          </div>

          {/* Mission */}
          <section className="space-y-6 rounded-[2rem] border border-border bg-secondary/50 p-1.5">
            <div className="rounded-[calc(2rem-0.375rem)] bg-card p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <h2 className="mb-3 text-2xl font-extrabold tracking-[-0.02em] text-foreground">Our Mission</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                We believe quality education should be accessible to everyone, regardless of budget. By aggregating free courses in one place, we save you time and help you learn new skills without breaking the bank.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="space-y-6">
            <div>
              <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Process
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-foreground">How Udecoupe Works</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-5 rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/25 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--primary)_25%,transparent)]">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">We Hunt for Deals</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Our system continuously scans coupon aggregators to find free Udemy courses.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/25 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--primary)_25%,transparent)]">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">We Verify & Enrich</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Every course is validated and enriched with accurate category, difficulty, and description.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/25 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--primary)_25%,transparent)]">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">You Enroll & Learn</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Browse verified coupons, click "Get Free Course", and start learning on Udemy instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/25 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--primary)_25%,transparent)]">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">We Keep it Fresh</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Expired coupons are automatically removed. New deals appear daily — never miss one.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Affiliate Model */}
          <section className="space-y-6 rounded-lg border-2 border-amber-500 bg-amber-50 p-8 dark:bg-amber-950/30">
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-amber-900 dark:text-amber-100">How We Stay Free</h2>
              <p className="text-amber-800 dark:text-amber-200">
                Udecoupe is free to use because of our affiliate partnership with Udemy. When you enroll in a course
                through our links, Udemy pays us a small commission. This means:
              </p>
            </div>
            <ul className="space-y-3 text-amber-800 dark:text-amber-200">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-lg">✓</span>
                <span>
                  <strong>The course price stays the same</strong> — you don&apos;t pay extra using our link
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-lg">✓</span>
                <span>
                  <strong>We earn a commission</strong> — which covers server costs and development
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-lg">✓</span>
                <span>
                  <strong>You get value</strong> — we curate, verify, and highlight the best free courses
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 text-lg">✓</span>
                <span>
                  <strong>Everyone wins</strong> — Udemy gets quality learners, we get sustainable income, you get
                  free courses
                </span>
              </li>
            </ul>
          </section>

          {/* Why Udecoupe */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Why Choose Udecoupe?</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 font-semibold text-foreground">Verified Coupons</h3>
                <p className="text-sm text-muted-foreground">
                  Every course includes an active coupon code. No expired links or false promises.
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 font-semibold text-foreground">Daily Updates</h3>
                <p className="text-sm text-muted-foreground">
                  New free courses added every day. Never miss a deal with email digests.
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 font-semibold text-foreground">AI Quality Filter</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI flags spam and suspicious listings so you only see legitimate courses.
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 font-semibold text-foreground">100% Free</h3>
                <p className="text-sm text-muted-foreground">
                  No paywalls, no premium tiers, no hidden fees. Completely free to use.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Questions?</h2>
            <p className="text-muted-foreground">
              Have feedback, found a bug, or want to get in touch? We&apos;d love to hear from you.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="/contact"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Contact Us
              </a>
              <a
                href="/"
                className="rounded-lg border border-border px-6 py-3 font-medium text-foreground transition hover:bg-secondary"
              >
                Browse Courses
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
