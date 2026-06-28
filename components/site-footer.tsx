import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 text-base font-extrabold tracking-tight text-foreground">
            Ude<span className="text-primary">coupe</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Hand-picked free Udemy courses with active coupons, verified and refreshed daily.
            We are not affiliated with Udemy.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
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
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Udecoupe. Coupon availability and pricing are set by
          Udemy and may change at any time.
        </div>
      </div>
    </footer>
  )
}
