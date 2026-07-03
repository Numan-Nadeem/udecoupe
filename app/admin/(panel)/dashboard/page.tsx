import Link from "next/link"
import { startOfDay } from "date-fns"
import { count, desc, eq, gte } from "drizzle-orm"
import { db } from "@/lib/db"
import { courses, couponClicks, subscribers, cronLogs } from "@/lib/schema"

export const metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [
    [activeCourses],
    [clicksToday],
    [verifiedSubs],
    [lastCron],
    [flaggedCount],
    categoryBreakdown,
    difficultyBreakdown,
  ] = await Promise.all([
    db.select({ count: count() }).from(courses).where(eq(courses.isActive, true)),
    db
      .select({ count: count() })
      .from(couponClicks)
      .where(gte(couponClicks.clickedAt, startOfDay(new Date()))),
    db.select({ count: count() }).from(subscribers).where(eq(subscribers.isVerified, true)),
    db
      .select()
      .from(cronLogs)
      .where(eq(cronLogs.status, "success"))
      .orderBy(desc(cronLogs.runAt))
      .limit(1),
    db.select({ count: count() }).from(courses).where(eq(courses.isFlagged, true)),
    db
      .select({ category: courses.category, count: count() })
      .from(courses)
      .where(eq(courses.isActive, true))
      .groupBy(courses.category)
      .orderBy(desc(count())),
    db
      .select({ difficulty: courses.difficulty, count: count() })
      .from(courses)
      .where(eq(courses.isActive, true))
      .groupBy(courses.difficulty)
      .orderBy(desc(count())),
  ])

  const stats = [
    { label: "Active courses", value: activeCourses.count, href: "/admin/courses" },
    { label: "Clicks today", value: clicksToday.count, href: null },
    { label: "Verified subscribers", value: verifiedSubs.count, href: "/admin/subscribers" },
    { label: "Flagged for review", value: flaggedCount.count, href: "/admin/flagged" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your site&apos;s activity and health.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                {s.value}
              </p>
            </div>
          )
          return s.href ? (
            <Link key={s.label} href={s.href} className="transition hover:opacity-80">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Last successful cron run</h2>
        {lastCron ? (
          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span>
              Ran at:{" "}
              <span className="font-medium text-foreground">
                {lastCron.runAt ? new Date(lastCron.runAt).toLocaleString() : "—"}
              </span>
            </span>
            <span>
              Source: <span className="font-medium text-foreground">{lastCron.sourceName ?? "—"}</span>
            </span>
            <span>
              Added: <span className="font-medium text-foreground">{lastCron.coursesAdded ?? 0}</span>
            </span>
            <span>
              Expired: <span className="font-medium text-foreground">{lastCron.coursesExpired ?? 0}</span>
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No successful cron runs recorded yet.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Courses by category</h2>
          <ul className="flex flex-col gap-2">
            {categoryBreakdown.length === 0 && (
              <li className="text-sm text-muted-foreground">No active courses.</li>
            )}
            {categoryBreakdown.map((row) => (
              <li
                key={row.category ?? "uncategorized"}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{row.category ?? "Uncategorized"}</span>
                <span className="font-semibold text-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Courses by difficulty</h2>
          <ul className="flex flex-col gap-2">
            {difficultyBreakdown.length === 0 && (
              <li className="text-sm text-muted-foreground">No active courses.</li>
            )}
            {difficultyBreakdown.map((row) => (
              <li
                key={row.difficulty ?? "unknown"}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{row.difficulty ?? "Unspecified"}</span>
                <span className="font-semibold text-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
