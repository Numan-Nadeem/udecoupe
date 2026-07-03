"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createSource, deleteSource, toggleSourceActive } from "@/app/admin/(panel)/sources/actions"

type SourceRow = {
  id: number
  name: string
  url: string
  isActive: boolean | null
  lastFetchedAt: Date | null
  failCount: number | null
}

type ProgressLine = {
  key: number
  text: string
  tone: "info" | "success" | "warn" | "error"
}

export function SourcesManager({ rows }: { rows: SourceRow[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const logEndRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [fetchingId, setFetchingId] = useState<number | null>(null)
  const [progressLines, setProgressLines] = useState<ProgressLine[]>([])
  const [progressSource, setProgressSource] = useState<string | null>(null)
  const lineKey = useRef(0)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [progressLines])

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await createSource(formData)
      if (res.error) {
        setError(res.error)
      } else {
        formRef.current?.reset()
      }
    })
  }

  function handleToggle(id: number) {
    setError(null)
    startTransition(async () => {
      const res = await toggleSourceActive(id)
      if (res.error) setError(res.error)
    })
  }

  function handleDelete(id: number) {
    setError(null)
    startTransition(async () => {
      const res = await deleteSource(id)
      if (res.error) setError(res.error)
      setConfirmId(null)
    })
  }

  function pushLine(text: string, tone: ProgressLine["tone"]) {
    lineKey.current += 1
    setProgressLines((prev) => [...prev.slice(-199), { key: lineKey.current, text, tone }])
  }

  async function handleFetchNow(id: number, name: string) {
    if (fetchingId !== null) return
    setError(null)
    setProgressLines([])
    setProgressSource(name)
    setFetchingId(id)

    try {
      const response = await fetch(`/admin/sources/${id}/fetch`, { method: "POST" })
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null)
        setError(body?.error || `Fetch failed (${response.status})`)
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
      setError(`Fetch failed: ${String(err)}`.slice(0, 300))
    } finally {
      setFetchingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        ref={formRef}
        action={handleCreate}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="source-name" className="text-xs font-semibold text-muted-foreground">
            Name
          </label>
          <input
            id="source-name"
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Real Discount"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-[2] flex-col gap-1.5">
          <label htmlFor="source-url" className="text-xs font-semibold text-muted-foreground">
            Feed URL
          </label>
          <input
            id="source-url"
            name="url"
            type="url"
            required
            maxLength={2000}
            placeholder="https://example.com/feed.xml"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add source"}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {(progressLines.length > 0 || fetchingId !== null) && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold text-foreground">
              {fetchingId !== null ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
                  Fetching &quot;{progressSource}&quot;...
                </span>
              ) : (
                `Fetch log — ${progressSource}`
              )}
            </p>
            {fetchingId === null && (
              <button
                type="button"
                onClick={() => {
                  setProgressLines([])
                  setProgressSource(null)
                }}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Dismiss
              </button>
            )}
          </div>
          <div
            role="log"
            aria-live="polite"
            className="max-h-64 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
          >
            {progressLines.map((line) => (
              <p
                key={line.key}
                className={
                  line.tone === "success"
                    ? "text-primary"
                    : line.tone === "warn"
                      ? "text-amber-600 dark:text-amber-400"
                      : line.tone === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                }
              >
                {line.text}
              </p>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No RSS sources yet. Add one above to start ingesting coupons.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
                <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">URL</th>
                <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Last fetched</th>
                <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Failures</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-muted-foreground" title={s.url}>
                    {s.url}
                  </td>
                  <td className="px-4 py-3">
                    {s.isActive ? (
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        Paused
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.lastFetchedAt
                      ? new Date(s.lastFetchedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={s.failCount && s.failCount > 0 ? "font-semibold text-destructive" : "text-muted-foreground"}>
                      {s.failCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFetchNow(s.id, s.name)}
                        disabled={isPending || fetchingId !== null}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
                      >
                        {fetchingId === s.id ? "Fetching..." : "Fetch now"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(s.id)}
                        disabled={isPending}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
                      >
                        {s.isActive ? "Pause" : "Activate"}
                      </button>
                      {confirmId === s.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            disabled={isPending}
                            className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition hover:brightness-110 disabled:opacity-50"
                          >
                            {isPending ? "Deleting..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={isPending}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(s.id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                        >
                          Delete
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
