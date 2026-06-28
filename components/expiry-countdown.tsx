"use client"

import { useEffect, useState } from "react"

function compute(expiresAt: string | Date) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { expired: true, text: "Expired", urgent: true }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const urgent = diff < 1000 * 60 * 60 * 24 // under 24h

  let text: string
  if (days > 0) text = `${days}d ${hours}h left`
  else if (hours > 0) text = `${hours}h ${minutes}m left`
  else text = `${minutes}m ${seconds}s left`

  return { expired: false, text, urgent }
}

export function ExpiryCountdown({
  expiresAt,
  precise = false,
  className = "",
}: {
  expiresAt: string | Date | null
  precise?: boolean
  className?: string
}) {
  const [state, setState] = useState<{ expired: boolean; text: string; urgent: boolean } | null>(null)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => setState(compute(expiresAt))
    tick()
    const interval = setInterval(tick, precise ? 1000 : 30_000)
    return () => clearInterval(interval)
  }, [expiresAt, precise])

  if (!expiresAt) {
    return <span className={className}>No expiry</span>
  }

  if (!state) {
    return <span className={className}>Calculating…</span>
  }

  const color = state.expired
    ? "text-destructive"
    : state.urgent
      ? "text-[oklch(0.55_0.18_45)]"
      : "text-muted-foreground"

  return (
    <span className={`tabular-nums ${color} ${className}`} suppressHydrationWarning>
      {state.text}
    </span>
  )
}
