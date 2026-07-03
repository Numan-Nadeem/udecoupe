"use client"

import { useState, useTransition } from "react"
import { deleteSubscriber } from "@/app/admin/(panel)/subscribers/actions"

type SubscriberRow = {
  id: number
  email: string
  isVerified: boolean | null
  subscribedAt: Date | null
}

export function SubscriberTable({ rows }: { rows: SubscriberRow[] }) {
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleDelete(id: number) {
    setError(null)
    startTransition(async () => {
      const res = await deleteSubscriber(id)
      if (res.error) setError(res.error)
      setConfirmId(null)
    })
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No subscribers found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Email</th>
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Subscribed</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{s.email}</td>
                <td className="px-4 py-3">
                  {s.isVerified ? (
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {confirmId === s.id ? (
                    <span className="inline-flex items-center gap-2">
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
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(s.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
