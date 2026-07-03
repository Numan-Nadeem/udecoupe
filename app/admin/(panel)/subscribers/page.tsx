import { db } from "@/lib/db"
import { subscribers } from "@/lib/schema"
import { and, count, desc, eq, ilike, type SQL } from "drizzle-orm"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { SubscriberTable } from "@/components/admin/subscriber-table"
import Link from "next/link"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 25

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const q = (params.q ?? "").trim().slice(0, 200)
  const status = params.status === "verified" || params.status === "pending" ? params.status : ""
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  const conditions: SQL[] = []
  if (q) conditions.push(ilike(subscribers.email, `%${q}%`))
  if (status === "verified") conditions.push(eq(subscribers.isVerified, true))
  if (status === "pending") conditions.push(eq(subscribers.isVerified, false))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, totalResult, verifiedResult] = await Promise.all([
    db
      .select()
      .from(subscribers)
      .where(whereClause)
      .orderBy(desc(subscribers.subscribedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(subscribers).where(whereClause),
    db.select({ value: count() }).from(subscribers).where(eq(subscribers.isVerified, true)),
  ])

  const total = totalResult[0]?.value ?? 0
  const verified = verifiedResult[0]?.value ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} total &middot; {verified} verified
          </p>
        </div>
        <a
          href="/admin/subscribers/export"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          Export CSV
        </a>
      </div>

      <form className="flex flex-wrap items-center gap-3" action="/admin/subscribers" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search email..."
          className="w-full max-w-xs rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Filter
        </button>
        {(q || status) && (
          <Link href="/admin/subscribers" className="text-sm text-muted-foreground hover:text-foreground">
            Clear
          </Link>
        )}
      </form>

      <SubscriberTable rows={rows} />

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/subscribers" params={{ q, status }} />
    </div>
  )
}
