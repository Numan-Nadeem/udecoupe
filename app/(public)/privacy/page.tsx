import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Udecoupe",
  description: "Learn how Udecoupe collects, uses, and protects your data. Affiliate link disclosure.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">Last updated: July 2026</p>
          </div>

          {/* Affiliate Disclosure - Prominent */}
          <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-6 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔗</div>
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Affiliate Link Disclosure</h3>
                <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                  Udecoupe uses affiliate links to Udemy. When you enroll in a course through our links, we may earn a
                  commission at no additional cost to you. This disclosure complies with FTC guidelines and helps us
                  maintain this free service.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly, such as when you subscribe to our email list or contact us.
                This may include your name, email address, and message content.
              </p>
              <p className="text-muted-foreground">
                We also automatically collect technical information through cookies and tracking pixels, including your
                IP address, browser type, referral source, and pages visited. This helps us understand how you use
                Udecoupe and improve our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>To send you emails about new free courses and promotions (only if you subscribe)</li>
                <li>To track affiliate referrals and measure campaign performance</li>
                <li>To analyze usage patterns and improve our website</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Cookies & Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies to remember your preferences and track affiliate referrals. We also use Google Analytics
                and other tracking technologies to understand user behavior. You can disable cookies in your browser
                settings, though this may affect your experience.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Third-Party Services</h2>
              <p className="text-muted-foreground">
                We use third-party services including:
              </p>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>
                  <strong>Google Analytics</strong> — to track website traffic and user engagement
                </li>
                <li>
                  <strong>Udemy Affiliate Program</strong> — to process course referrals and earn commissions
                </li>
                <li>
                  <strong>Email Service Provider</strong> — to send newsletters (with your consent)
                </li>
                <li>
                  <strong>Vercel</strong> — to host and serve our website
                </li>
              </ul>
              <p className="text-muted-foreground">
                These services have their own privacy policies. We recommend reviewing them.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Data Security</h2>
              <p className="text-muted-foreground">
                We use HTTPS encryption and follow industry best practices to protect your data. However, no online
                transmission is 100% secure. If you believe your information has been compromised, please contact us
                immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to:
              </p>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Request correction or deletion of your data</li>
                <li>Opt out of marketing emails anytime</li>
                <li>Request a copy of your data in a portable format</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, contact us at privacy@udecoupe.com.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground">
                Udecoupe is not intended for children under 13. We do not knowingly collect personal information from
                children. If we learn we have collected data from a child, we will delete it immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy periodically. We will notify you of material changes by posting the
                updated policy on this page with a new &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this privacy policy or how we handle your data, please contact us at:
              </p>
              <p className="font-medium text-foreground">privacy@udecoupe.com</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
