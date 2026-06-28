"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={close}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Ude<span className="text-primary">coupe</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/?sort=expiring"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            Expiring soon
          </Link>
          <Link
            href="/#subscribe"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
          >
            Get alerts
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile / tablet controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition hover:bg-secondary"
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile / tablet dropdown panel */}
      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-background md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            <Link
              href="/?sort=expiring"
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Expiring soon
            </Link>
            <Link
              href="/#subscribe"
              onClick={close}
              className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
            >
              Get alerts
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
