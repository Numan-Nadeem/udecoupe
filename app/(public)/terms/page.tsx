import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Udecoupe",
  description: "Read our terms and conditions. Learn about our affiliate relationship with Udemy.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">Last updated: July 2026</p>
          </div>

          {/* Affiliate Notice - Prominent */}
          <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 dark:bg-blue-950/30">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💼</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Affiliate Relationship</h3>
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                  Udecoupe is an independent affiliate of Udemy. We earn commissions on course referrals. Udemy does
                  not endorse or control Udecoupe. All course links redirect to Udemy.com with our affiliate code
                  attached.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Use License</h2>
              <p className="text-muted-foreground">
                Udecoupe grants you a limited, non-exclusive license to use this website for personal, non-commercial
                purposes only. You agree not to:
              </p>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>Reproduce, distribute, or transmit any content without permission</li>
                <li>Use automated tools, bots, or scrapers to access our site</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass, abuse, or threaten other users or our team</li>
                <li>Engage in any illegal activity on our platform</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Affiliate Links & Disclaimers</h2>
              <p className="text-muted-foreground">
                All course links on Udecoupe are affiliate links. When you click a link and enroll in a course, Udemy
                may pay us a commission. This does not increase the price you pay — the course cost is the same whether
                you use our link or go directly to Udemy.
              </p>
              <p className="text-muted-foreground">
                We recommend courses we believe provide value, but we do not guarantee course quality or your
                satisfaction. Always read course reviews on Udemy before enrolling.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Accuracy of Information</h2>
              <p className="text-muted-foreground">
                We strive to keep course listings accurate and up-to-date. However, course details (price, instructor,
                rating, expiry date) may change without notice. Udemy is the authoritative source for course
                information. If you notice an error, please contact us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Email Subscriptions</h2>
              <p className="text-muted-foreground">
                By subscribing to our email list, you agree to receive periodic emails about new free courses and
                special offers. You can unsubscribe anytime by clicking the unsubscribe link in any email.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. User-Submitted Content</h2>
              <p className="text-muted-foreground">
                If you submit comments, messages, or other content to Udecoupe (e.g., via our contact form), you grant
                us the right to use that content for customer support and improvement purposes. Do not submit sensitive
                or personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Udecoupe is provided &quot;as is&quot; without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>Errors, omissions, or inaccuracies in course listings</li>
                <li>Course quality, instructor performance, or learning outcomes</li>
                <li>Website downtime, technical issues, or data loss</li>
                <li>Third-party actions, including Udemy policy changes or link removals</li>
                <li>Any indirect, incidental, or consequential damages</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms are governed by the laws of the jurisdiction where Udecoupe operates. Any disputes shall be
                resolved in the appropriate courts of that jurisdiction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of Udecoupe after changes
                constitutes acceptance of the new terms. We will post significant changes prominently.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Contact</h2>
              <p className="text-muted-foreground">
                If you have questions about these terms, please contact us at:
              </p>
              <p className="font-medium text-foreground">legal@udecoupe.com</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
