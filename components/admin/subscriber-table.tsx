"use client"

import { useState, useTransition } from "react"
import { deleteSubscriber } from "@/app/admin/(panel)/subscribers/actions"

type SubscriberRow = {
  id: number
  email: string
  isVerified: boolean | null
  subscribedAt: Date | null
  verifiedAt: Date | null
}

function formatDate(d: Date | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function SubscriberTable({ rows }: { rows: SubscriberRow[] }) {
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  function handleDelete(id: number) {
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    startTransition(async () => {
      await deleteSubscriber(id)
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
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Subscribed</th>
            <th className="px-4 py-3 font-medium">Verified</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">{row.email}</td>
              <td className="px-4 py-3">
                {row.isVerified ? (
                  <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    Pending
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(row.subscribedAt)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(row.verifiedAt)}</td>
              <td className="px-4 py-3 text-right">
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
                  {confirmId === row.id ? "Confirm delete?" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
