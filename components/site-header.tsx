"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-border/70 bg-background/75 px-4 shadow-[0_8px_30px_-12px_color-mix(in_oklch,var(--primary)_25%,transparent)] backdrop-blur-xl sm:px-5">
        <Link href="/" className="flex items-center gap-2" onClick={close}>
          <Logo className="h-5 w-auto sm:h-9" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1.5 md:flex">
          <Link
            href="/?sort=expiring"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-secondary hover:text-foreground"
          >
            Expiring soon
          </Link>
          <Link
            href="/about"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-secondary hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/#subscribe"
            className="group ml-1 flex items-center gap-2 rounded-full bg-primary py-1.5 pl-4 pr-1.5 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-110 active:scale-[0.98]"
          >
            Get alerts
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
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
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:bg-secondary"
          >
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "rotate-45" : "-translate-y-[5px]"
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "-rotate-45" : "translate-y-[5px]"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile / tablet dropdown panel */}
      <div
        id="mobile-nav"
        className={`mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-background/90 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          open ? "max-h-64 opacity-100" : "pointer-events-none max-h-0 border-transparent opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3">
          <Link
            href="/?sort=expiring"
            onClick={close}
            className={`rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-secondary hover:text-foreground ${
              open ? "translate-y-0 opacity-100 delay-100" : "translate-y-4 opacity-0"
            }`}
          >
            Expiring soon
          </Link>
          <Link
            href="/about"
            onClick={close}
            className={`rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-secondary hover:text-foreground ${
              open ? "translate-y-0 opacity-100 delay-150" : "translate-y-4 opacity-0"
            }`}
          >
            About
          </Link>
          <Link
            href="/#subscribe"
            onClick={close}
            className={`rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-110 ${
              open ? "translate-y-0 opacity-100 delay-200" : "translate-y-4 opacity-0"
            }`}
          >
            Get alerts
          </Link>
        </nav>
      </div>
    </header>
  )
}
