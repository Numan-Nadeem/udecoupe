"use client"

import { useState } from "react"

type AuditRow = {
  id: number
  action: string | null
  entity: string | null
  entityId: number | null
  changedFields: unknown
  performedAt: Date | null
  ipHash: string | null
}

const ACTION_STYLES: Record<string, string> = {
  create: "bg-primary/10 text-primary",
  update: "bg-accent/20 text-accent-foreground",
  delete: "bg-destructive/10 text-destructive",
}

export function AuditLogTable({ rows }: { rows: AuditRow[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No audit events yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Performed at</th>
            <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Action</th>
            <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Entity</th>
            <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">Entity ID</th>
            <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">IP hash</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-muted-foreground">Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((log) => (
            <AuditRowItem
              key={log.id}
              log={log}
              expanded={expandedId === log.id}
              onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AuditRowItem({
  log,
  expanded,
  onToggle,
}: {
  log: AuditRow
  expanded: boolean
  onToggle: () => void
}) {
  const hasDetails = log.changedFields != null && Object.keys(log.changedFields as object).length > 0

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-3 text-muted-foreground">
          {log.performedAt
            ? new Date(log.performedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
            : "—"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              ACTION_STYLES[log.action ?? ""] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {log.action ?? "unknown"}
          </span>
        </td>
        <td className="px-4 py-3 font-medium text-foreground">{log.entity ?? "—"}</td>
        <td className="px-4 py-3 text-muted-foreground">{log.entityId ?? "—"}</td>
        <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs text-muted-foreground" title={log.ipHash ?? undefined}>
          {log.ipHash ? `${log.ipHash.slice(0, 12)}...` : "—"}
        </td>
        <td className="px-4 py-3 text-right">
          {hasDetails ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              {expanded ? "Hide" : "View"}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
      </tr>
      {expanded && hasDetails && (
        <tr className="border-b border-border last:border-0">
          <td colSpan={6} className="bg-muted/50 px-4 py-3">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
              {JSON.stringify(log.changedFields, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}
