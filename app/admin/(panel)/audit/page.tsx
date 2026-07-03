import { db } from "@/lib/db"
import { adminAuditLogs } from "@/lib/schema"
import { count, desc } from "drizzle-orm"
import { AdminPagination } from "@/components/admin/admin-pagination"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 30

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

function ActionBadge({ action }: { action: string | null }) {
  const styles: Record<string, string> = {
    create: "bg-primary/10 text-primary",
    update: "bg-accent/20 text-accent-foreground",
    delete: "bg-destructive/10 text-destructive",
    login: "bg-secondary text-secondary-foreground",
  }
  const key = action ?? "unknown"
  const style = styles[key] ?? "bg-muted text-muted-foreground"
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {key}
    </span>
  )
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.performedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(adminAuditLogs),
  ])

  const total = totalResult[0]?.value ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every admin action is recorded here. {total} entries.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No audit entries yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Entity ID</th>
                <th className="px-4 py-3 font-medium">Changed fields</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fields =
                  row.changedFields && typeof row.changedFields === "object"
                    ? Object.keys(row.changedFields as Record<string, unknown>)
                    : []
                return (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(row.performedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={row.action} />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.entity ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.entityId ?? "—"}</td>
                    <td className="max-w-72 truncate px-4 py-3 text-muted-foreground" title={fields.join(", ")}>
                      {fields.length > 0 ? fields.join(", ") : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/audit" params={{}} />
    </div>
  )
}
