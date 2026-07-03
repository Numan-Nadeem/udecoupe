"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export type ProgressLine = {
  key: number
  text: string
  tone: "info" | "success" | "warn" | "error"
}

type FetchProgressContextValue = {
  /** Source id currently being fetched, or null when idle */
  fetchingId: number | null
  /** Name of the source the log belongs to */
  progressSource: string | null
  /** Live log lines (kept across navigation) */
  progressLines: ProgressLine[]
  /** Kick off a manual fetch for a source — no-op if one is already running */
  startFetch: (id: number, name: string) => void
  /** Clear the finished log */
  clearLog: () => void
  /** Last error hit while starting/reading the stream */
  fetchError: string | null
}

const FetchProgressContext = createContext<FetchProgressContextValue | null>(null)

export function useFetchProgress(): FetchProgressContextValue {
  const ctx = useContext(FetchProgressContext)
  if (!ctx) {
    throw new Error("useFetchProgress must be used within FetchProgressProvider")
  }
  return ctx
}

/**
 * Owns the manual RSS fetch stream at the admin layout level so that the
 * live progress log and "Fetching..." state survive client-side navigation
 * between admin pages. Navigating away no longer kills the log — coming
 * back to Sources shows the still-running (or finished) fetch log.
 */
export function FetchProgressProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [fetchingId, setFetchingId] = useState<number | null>(null)
  const [progressSource, setProgressSource] = useState<string | null>(null)
  const [progressLines, setProgressLines] = useState<ProgressLine[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const lineKey = useRef(0)
  const runningRef = useRef(false)

  const pushLine = useCallback((text: string, tone: ProgressLine["tone"]) => {
    lineKey.current += 1
    const key = lineKey.current
    setProgressLines((prev) => [...prev.slice(-199), { key, text, tone }])
  }, [])

  const clearLog = useCallback(() => {
    if (runningRef.current) return
    setProgressLines([])
    setProgressSource(null)
    setFetchError(null)
  }, [])

  const startFetch = useCallback(
    (id: number, name: string) => {
      if (runningRef.current) return
      runningRef.current = true
      setFetchError(null)
      setProgressLines([])
      setProgressSource(name)
      setFetchingId(id)

      void (async () => {
        try {
          const response = await fetch(`/admin/sources/${id}/fetch`, { method: "POST" })
          if (!response.ok || !response.body) {
            const body = await response.json().catch(() => null)
            setFetchError(body?.error || `Fetch failed (${response.status})`)
            return
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ""

            for (const line of lines) {
              if (!line.trim()) continue
              let event: Record<string, unknown>
              try {
                event = JSON.parse(line)
              } catch {
                continue
              }

              if (event.type === "status") {
                pushLine(String(event.message), "info")
              } else if (event.type === "feed") {
                pushLine(`Feed parsed: ${event.total} item${event.total === 1 ? "" : "s"} found.`, "info")
              } else if (event.type === "item") {
                const prefix = `[${event.index}/${event.total}]`
                const title = String(event.title).slice(0, 70)
                if (event.status === "duplicate") {
                  pushLine(`${prefix} Skipped (already in database): ${title}`, "info")
                } else if (event.status === "resolving") {
                  pushLine(`${prefix} Resolving Udemy link + coupon code: ${title}`, "info")
                } else if (event.status === "enriching") {
                  pushLine(`${prefix} AI enriching: ${title}`, "info")
                } else if (event.status === "added") {
                  pushLine(`${prefix} Added (active): ${title}`, "success")
                } else if (event.status === "flagged") {
                  pushLine(
                    `${prefix} Added but FLAGGED for review: ${title}${event.detail ? ` — ${event.detail}` : ""}`,
                    "warn",
                  )
                } else if (event.status === "error") {
                  pushLine(`${prefix} Failed: ${title}${event.detail ? ` — ${event.detail}` : ""}`, "error")
                }
              } else if (event.type === "done") {
                pushLine(
                  `Done — ${event.added} added (${event.flagged} flagged), ${event.skipped} duplicates skipped, ${event.errors} error${event.errors === 1 ? "" : "s"}.`,
                  "success",
                )
              } else if (event.type === "fatal") {
                pushLine(`Fetch failed: ${event.message}`, "error")
              }
            }
          }
          router.refresh()
        } catch (err) {
          setFetchError(`Fetch failed: ${String(err)}`.slice(0, 300))
        } finally {
          runningRef.current = false
          setFetchingId(null)
        }
      })()
    },
    [pushLine, router],
  )

  return (
    <FetchProgressContext.Provider
      value={{ fetchingId, progressSource, progressLines, startFetch, clearLog, fetchError }}
    >
      {children}
    </FetchProgressContext.Provider>
  )
}
