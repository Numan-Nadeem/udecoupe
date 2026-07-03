import Link from "next/link"
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db } from "@/lib/db"
import { courses } from "@/lib/schema"
import { CATEGORIES } from "@/lib/categories"
import { CourseTable } from "@/components/admin/course-table"
import { AdminPagination } from "@/components/admin/admin-pagination"

export const metadata = { title: "Courses" }
export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1)
  const search = typeof params.search === "string" ? params.search.slice(0, 100) : ""
  const category = typeof params.category === "string" ? params.category : ""
  const isActive =
    params.is_active === "true" ? true : params.is_active === "false" ? false : null
  const isFlagged =
    params.is_flagged === "true" ? true : params.is_flagged === "false" ? false : null
  const sort = typeof params.sort === "string" ? params.sort : "created_at"

  const conditions: SQL[] = []
  if (search) {
    const term = `%${search.replace(/[%_\\]/g, "\\$&")}%`
    const searchCond = or(ilike(courses.title, term), ilike(courses.instructor, term))
    if (searchCond) conditions.push(searchCond)
  }
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    conditions.push(eq(courses.category, category))
  }
  if (isActive !== null) conditions.push(eq(courses.isActive, isActive))
  if (isFlagged !== null) conditions.push(eq(courses.isFlagged, isFlagged))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const orderBy =
    sort === "rating"
      ? desc(courses.rating)
      : sort === "expires_at"
        ? asc(courses.expiresAt)
        : desc(courses.createdAt)

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: courses.id,
        title: courses.title,
        category: courses.category,
        difficulty: courses.difficulty,
        isActive: courses.isActive,
        isFlagged: courses.isFlagged,
        expiresAt: courses.expiresAt,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(where)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: count() }).from(courses).where(where),
  ])

  const totalPages = Math.max(1, Math.ceil(total.count / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total.count} total</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Add course
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="search" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Title or instructor"
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-xs font-medium text-muted-foreground">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="is_active" className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            id="is_active"
            name="is_active"
            defaultValue={isActive === null ? "" : String(isActive)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="is_flagged" className="text-xs font-medium text-muted-foreground">
            Flagged
          </label>
          <select
            id="is_flagged"
            name="is_flagged"
            defaultValue={isFlagged === null ? "" : String(isFlagged)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
          >
            <option value="">All</option>
            <option value="true">Flagged</option>
            <option value="false">Not flagged</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="sort" className="text-xs font-medium text-muted-foreground">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
          >
            <option value="created_at">Newest</option>
            <option value="rating">Rating</option>
            <option value="expires_at">Expiring soon</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-secondary px-4 py-1.5 text-sm font-semibold text-secondary-foreground transition hover:opacity-80"
        >
          Apply
        </button>
      </form>

      <CourseTable
        courses={rows.map((r) => ({
          ...r,
          expiresAt: r.expiresAt?.toISOString() ?? null,
          createdAt: r.createdAt?.toISOString() ?? null,
        }))}
      />

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/courses" params={params} />
    </div>
  )
}
