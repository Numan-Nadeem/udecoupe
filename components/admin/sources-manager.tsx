"use client"

import { useActionState, useState, useTransition } from "react"
import { createSource, deleteSource, toggleSource, type SourceFormState } from "@/app/admin/(panel)/sources/actions"

type SourceRow = {
  id: number
  name: string
  url: string
  isActive: boolean | null
  lastFetchedAt: Date | null
  failCount: number | null
}

function formatDate(d: Date | null) {
  if (!d) return "Never"
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const initialState: SourceFormState = {}

export function SourcesManager({ rows }: { rows: SourceRow[] }) {
  const [state, formAction, isFormPending] = useActionState(createSource, initialState)
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  function handleToggle(id: number) {
    startTransition(async () => {
      await toggleSource(id)
    })
  }

  function handleDelete(id: number) {
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    startTransition(async () => {
      await deleteSource(id)
      setConfirmId(null)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <label htmlFor="source-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Name
          </label>
          <input
            id="source-name"
            name="name"
            required
            maxLength={120}
            placeholder="e.g. Real Discount"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex min-w-64 flex-[2] flex-col gap-1.5">
          <label htmlFor="source-url" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Feed URL
          </label>
          <input
            id="source-url"
            name="url"
            type="url"
            required
            maxLength={2000}
            placeholder="https://example.com/feed.xml"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={isFormPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
        >
          {isFormPending ? "Adding..." : "Add source"}
        </button>
        {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No RSS sources configured yet. Add one above to enable automated course discovery.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last fetched</th>
                <th className="px-4 py-3 font-medium">Failures</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="max-w-64 truncate px-4 py-3 text-muted-foreground" title={row.url}>
                    {row.url}
                  </td>
                  <td className="px-4 py-3">
                    {row.isActive ? (
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        Paused
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(row.lastFetchedAt)}</td>
                  <td className="px-4 py-3">
                    {(row.failCount ?? 0) > 0 ? (
                      <span className="font-semibold text-destructive">{row.failCount}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(row.id)}
                        disabled={isPending}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      >
                        {row.isActive ? "Pause" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        disabled={isPending}
                        className={
                          confirmId === row.id
                            ? "rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition hover:brightness-110 disabled:opacity-50"
                            : "rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
                        }
                      >
                        {confirmId === row.id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
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
