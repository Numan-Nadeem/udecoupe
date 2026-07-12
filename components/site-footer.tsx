import Link from "next/link"
import { Logo } from "@/components/logo"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm">
          <Logo className="h-10 w-auto" />
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Hand-picked free Udemy courses with active coupons, verified and refreshed daily.
            We are not affiliated with Udemy.
          </p>
        </div>
        <nav className="flex flex-col gap-4 text-sm sm:flex-row sm:gap-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/" className="text-muted-foreground transition hover:text-foreground">
              All courses
            </Link>
            <Link href="/?sort=expiring" className="text-muted-foreground transition hover:text-foreground">
              Expiring soon
            </Link>
            <Link href="/?sort=rating" className="text-muted-foreground transition hover:text-foreground">
              Top rated
            </Link>
            <Link href="/#subscribe" className="text-muted-foreground transition hover:text-foreground">
              Email alerts
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 sm:border-0 sm:pt-0">
            <Link href="/about" className="text-muted-foreground transition hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground transition hover:text-foreground">
              Contact
            </Link>
            <Link href="/privacy" className="text-muted-foreground transition hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground transition hover:text-foreground">
              Terms
            </Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="mb-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              <strong>💼 Affiliate Disclosure:</strong> Udecoupe uses affiliate links to Udemy. We earn commissions on
              course enrollments at no extra cost to you. See our{" "}
              <Link href="/privacy" className="underline hover:text-amber-950 dark:hover:text-amber-50">
                Privacy Policy
              </Link>
              {" and "}
              <Link href="/terms" className="underline hover:text-amber-950 dark:hover:text-amber-50">
                Terms of Service
              </Link>
              {" for details."}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Udecoupe. Coupon availability and pricing are set by Udemy and may change at
            any time.
          </p>
        </div>
      </div>
    </footer>
  )
}
