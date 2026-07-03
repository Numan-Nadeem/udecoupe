"use client"

import { useState } from "react"

type CronLogRow = {
  id: number
  runAt: Date | null
  sourceName: string | null
  coursesAdded: number | null
  coursesExpired: number | null
  errorMessage: string | null
  status: string | null
}

const STATUS_STYLES: Record<string, string> = {
  success: "bg-primary/10 text-primary",
  partial: "bg-accent/20 text-accent-foreground",
  error: "bg-destructive/10 text-destructive",
}

export function CronLogTable({ rows }: { rows: CronLogRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null)

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No cron runs logged yet. Logs appear once the ingestion agent runs.
      </div>
    )
  }

  const openRow = rows.find((r) => r.id === openId)

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Run at</th>
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Source</th>
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Added</th>
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Expired</th>
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-muted-foreground">Error</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((log) => (
              <tr key={log.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted-foreground">
                  {log.runAt
                    ? new Date(log.runAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                    : "—"}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{log.sourceName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{log.coursesAdded ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">{log.coursesExpired ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      STATUS_STYLES[log.status ?? ""] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {log.status ?? "unknown"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {log.errorMessage ? (
                    <button
                      type="button"
                      onClick={() => setOpenId(log.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                    >
                      View error
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openRow && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cron error details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setOpenId(null)}
        >
          <div
            className="max-h-[70vh] w-full max-w-lg overflow-auto rounded-xl border border-border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-foreground">
                Error — {openRow.sourceName ?? "unknown source"}
              </h2>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-secondary"
              >
                Close
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
              {openRow.errorMessage}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}
