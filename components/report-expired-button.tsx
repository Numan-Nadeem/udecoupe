"use client"

import { useState } from "react"
import { reportExpiredAction } from "@/app/actions/report"

export function ReportExpiredButton({
  courseId,
  className = "",
}: {
  courseId: number
  className?: string
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")

  async function handleClick() {
    if (state !== "idle") return
    setState("loading")
    try {
      await reportExpiredAction(courseId)
    } catch {
      // swallow — reporting is best effort
    }
    setState("done")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state !== "idle"}
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60 ${className}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      {state === "done" ? "Reported, thanks!" : state === "loading" ? "Reporting…" : "Report expired"}
    </button>
  )
}
