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


    </footer>
  )
}
