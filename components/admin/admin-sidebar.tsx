"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/flagged", label: "Flagged" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/sources", label: "RSS Sources" },
  { href: "/admin/logs", label: "Cron Logs" },
  { href: "/admin/audit", label: "Audit Trail" },
  { href: "/admin/settings", label: "Settings" },
]

export function AdminSidebar({ logoutSlot }: { logoutSlot: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {links.map((link) => {
        const active = pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <span className="text-sm font-extrabold tracking-tight text-foreground">
          Udecoupe Admin
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          className="rounded-lg border border-border p-2 text-foreground"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="admin-mobile-nav" className="border-b border-border bg-card p-3 md:hidden">
          {nav}
          <div className="mt-3 border-t border-border pt-3">{logoutSlot}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-border bg-card p-4 md:flex">
        <div>
          <div className="mb-6 px-2 text-base font-extrabold tracking-tight text-foreground">
            Udecoupe <span className="text-primary">Admin</span>
          </div>
          {nav}
        </div>
        <div className="border-t border-border pt-3">{logoutSlot}</div>
      </aside>
    </>
  )
}
