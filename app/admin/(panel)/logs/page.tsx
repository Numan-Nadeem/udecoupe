import type { Metadata } from "next"
import Link from "next/link"
import { and, count, desc, eq, type SQL } from "drizzle-orm"
import { db } from "@/lib/db"
import { cronLogs, rssSources } from "@/lib/schema"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { CronLogTable } from "@/components/admin/cron-log-table"

export const metadata: Metadata = {
  title: "Cron Logs",
}

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20
const STATUSES = ["success", "partial", "error"] as const

type SearchParams = Promise<{
  status?: string
  source?: string
  page?: string
}>

export default async function LogsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const status = STATUSES.includes(params.status as (typeof STATUSES)[number]) ? (params.status as string) : ""
  const source = (params.source ?? "").trim().slice(0, 100)
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  const conditions: SQL[] = []
  if (status) conditions.push(eq(cronLogs.status, status))
  if (source) conditions.push(eq(cronLogs.sourceName, source))
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, totalRow, sourceNames] = await Promise.all([
    db
      .select()
      .from(cronLogs)
      .where(where)
      .orderBy(desc(cronLogs.runAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(cronLogs).where(where),
    db.select({ name: rssSources.name }).from(rssSources).orderBy(rssSources.name),
  ])

  const total = totalRow[0]?.value ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cron Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} run{total === 1 ? "" : "s"} recorded from the ingestion agent.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/logs" method="get">
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={source}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All sources</option>
          {sourceNames.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Filter
        </button>
        {(status || source) && (
          <Link
            href="/admin/logs"
            className="h-10 rounded-lg border border-border px-4 text-sm font-medium leading-10 text-muted-foreground transition hover:bg-secondary"
          >
            Clear
          </Link>
        )}
      </form>

      <CronLogTable rows={rows} />

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/logs" params={{ status, source }} />
    </div>
  )
}
