import { db } from "@/lib/db"
import { cronLogs } from "@/lib/schema"
import { count, desc } from "drizzle-orm"
import { AdminPagination } from "@/components/admin/admin-pagination"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 25

function formatDate(d: Date | null) {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "success") {
    return (
      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
        Success
      </span>
    )
  }
  if (status === "partial") {
    return (
      <span className="inline-flex rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
        Partial
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
      {status ?? "Unknown"}
    </span>
  )
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(cronLogs)
      .orderBy(desc(cronLogs.runAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(cronLogs),
  ])

  const total = totalResult[0]?.value ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cron Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          History of automated RSS polling and expiry runs. {total} entries.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No cron runs recorded yet. Logs will appear here once the cron agent starts running.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Run at</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium">Expired</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(row.runAt)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.sourceName ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{row.coursesAdded ?? 0}</td>
                  <td className="px-4 py-3 text-foreground">{row.coursesExpired ?? 0}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="max-w-64 truncate px-4 py-3 text-muted-foreground" title={row.errorMessage ?? ""}>
                    {row.errorMessage ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/logs" params={{}} />
    </div>
  )
}
