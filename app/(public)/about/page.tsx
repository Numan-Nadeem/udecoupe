import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Udecoupe — Free Udemy Courses with Coupon Codes",
  description: "Learn how Udecoupe helps you find free Udemy courses. We use affiliate links to support our service.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">About Udecoupe</h1>
            <p className="text-xl text-muted-foreground">Finding free Udemy courses made simple</p>
          </div>

          {/* Mission */}
          <section className="space-y-6 rounded-lg border border-border bg-card p-8">
            <div>
              <h2 className="mb-3 text-2xl font-semibold text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                Udecoupe makes it easy to discover free Udemy courses with active coupon codes. We believe quality
                education should be accessible to everyone, regardless of budget. By aggregating free courses in one
                place, we save you time and help you learn new skills without breaking the bank.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">How Udecoupe Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">We Hunt for Deals</h3>
                  <p className="text-sm text-muted-foreground">
                    Our system continuously scans RSS feeds from coupon aggregators to find free Udemy courses.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Verify & Enrich</h3>
                  <p className="text-sm text-muted-foreground">
                    We resolve coupon codes and verify each course links to a real Udemy page with an active coupon.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI Enhancement</h3>
                  <p className="text-sm text-muted-foreground">
                    We use AI to improve course descriptions and flag low-quality or suspicious listings.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-semibold text-primary">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Send to You</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to get daily emails with the best free courses, organized by category.
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
