import Link from "next/link"
import { Logo } from "@/components/logo"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-12 md:gap-16 grid-cols-1 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo className="h-8 w-auto" />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Hand-picked free Udemy courses with active coupons, verified and refreshed daily.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Explore</p>
            <div className="mt-4 space-y-3">
              <Link href="/" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                All courses
              </Link>
              <Link href="/?sort=expiring" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                Expiring soon
              </Link>
              <Link href="/?sort=rating" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                Top rated
              </Link>
              <Link href="/#subscribe" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                Email alerts
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Company</p>
            <div className="mt-4 space-y-3">
              <Link href="/about" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                About
              </Link>
              <Link href="/contact" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
            <div className="mt-4 space-y-3">
              <Link href="/privacy" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="block text-sm font-medium text-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-secondary/30 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-4 rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3.5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-primary">Affiliate Disclosure:</span> Udecoupe uses affiliate links to Udemy. We earn commissions on course enrollments at no extra cost to you. See our{" "}
              <Link href="/privacy" className="font-medium text-primary underline underline-offset-2 transition-colors duration-300 hover:text-primary/80">
                Privacy Policy
              </Link>
              {" and "}
              <Link href="/terms" className="font-medium text-primary underline underline-offset-2 transition-colors duration-300 hover:text-primary/80">
                Terms of Service
              </Link>
              {" for details."}
            </p>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            © {new Date().getFullYear()} Udecoupe. Coupon availability and pricing are set by Udemy and may change at any time.
          </p>
        </div>
      </div>
    </footer>
  )
}
