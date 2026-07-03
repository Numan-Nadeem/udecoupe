import { desc, eq, gte, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { courses } from "@/lib/schema"
import { FlaggedTable } from "@/components/admin/flagged-table"

export const metadata = { title: "Flagged Courses" }
export const dynamic = "force-dynamic"

export default async function FlaggedPage() {
  const flagged = await db
    .select({
      id: courses.id,
      title: courses.title,
      isFlagged: courses.isFlagged,
      expiredReports: courses.expiredReports,
      isActive: courses.isActive,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .where(or(eq(courses.isFlagged, true), gte(courses.expiredReports, 3)))
    .orderBy(desc(courses.createdAt))
    .limit(200)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Flagged courses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Courses flagged automatically or with 3+ expired reports awaiting review.
        </p>
      </div>
      <FlaggedTable
        courses={flagged.map((c) => ({
          ...c,
          createdAt: c.createdAt?.toISOString() ?? null,
        }))}
      />
    </div>
  )
}
