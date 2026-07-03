import type { Metadata } from "next"
import Link from "next/link"
import { and, count, desc, eq, type SQL } from "drizzle-orm"
import { db } from "@/lib/db"
import { adminAuditLogs } from "@/lib/schema"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { AuditLogTable } from "@/components/admin/audit-log-table"

export const metadata: Metadata = {
  title: "Audit Log",
}

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20
const ACTIONS = ["create", "update", "delete", "activate", "deactivate", "login", "bulk_update"] as const
const ENTITIES = ["courses", "subscribers", "settings", "rss_sources", "auth"] as const

type SearchParams = Promise<{
  action?: string
  entity?: string
  page?: string
}>

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const action = ACTIONS.includes(params.action as (typeof ACTIONS)[number]) ? (params.action as string) : ""
  const entity = ENTITIES.includes(params.entity as (typeof ENTITIES)[number]) ? (params.entity as string) : ""
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  const conditions: SQL[] = []
  if (action) conditions.push(eq(adminAuditLogs.action, action))
  if (entity) conditions.push(eq(adminAuditLogs.entity, entity))
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(adminAuditLogs)
      .where(where)
      .orderBy(desc(adminAuditLogs.performedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(adminAuditLogs).where(where),
  ])

  const total = totalRow[0]?.value ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} admin action{total === 1 ? "" : "s"} recorded. IPs are stored as salted hashes.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/audit" method="get">
        <select
          name="action"
          defaultValue={action}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          name="entity"
          defaultValue={entity}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All entities</option>
          {ENTITIES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Filter
        </button>
        {(action || entity) && (
          <Link
            href="/admin/audit"
            className="h-10 rounded-lg border border-border px-4 text-sm font-medium leading-10 text-muted-foreground transition hover:bg-secondary"
          >
            Clear
          </Link>
        )}
      </form>

      <AuditLogTable rows={rows} />

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/audit" params={{ action, entity }} />
    </div>
  )
}
