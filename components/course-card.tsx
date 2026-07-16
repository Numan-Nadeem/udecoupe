import Link from "next/link"
import Image from "next/image"
import type { InferSelectModel } from "drizzle-orm"
import type { courses } from "@/lib/schema"
import { StarRating } from "./star-rating"
import { ExpiryCountdown } from "./expiry-countdown"
import { ReportExpiredButton } from "./report-expired-button"
import { categoryBadgeClass, formatStudents } from "@/lib/utils"

type Course = InferSelectModel<typeof courses>

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_color-mix(in_oklch,var(--primary)_6%,transparent)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_16px_40px_-16px_color-mix(in_oklch,var(--primary)_30%,transparent)]">
      <Link href={`/courses/${course.slug}`} className="relative m-1.5 block aspect-video overflow-hidden rounded-[calc(1rem-0.15rem)] bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl || "/placeholder.svg"}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground shadow-sm">
          Free
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-2.5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {course.category && (
            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${categoryBadgeClass(course.category)}`}>
              {course.category}
            </span>
          )}
          {course.difficulty && (
            <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {course.difficulty}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-pretty font-bold leading-snug tracking-[-0.01em] text-foreground">
          <Link
            href={`/courses/${course.slug}`}
            className="transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary"
          >
            {course.title}
          </Link>
        </h3>

        {course.instructor && (
          <p className="mt-1 truncate text-sm text-muted-foreground">by {course.instructor}</p>
        )}

        <div className="mb-4 mt-3 flex items-center gap-3 text-sm">
          <StarRating rating={course.rating} />
          {course.totalStudents ? (
            <span className="tabular-nums text-muted-foreground">
              {formatStudents(course.totalStudents)} students
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium tabular-nums">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <ExpiryCountdown expiresAt={course.expiresAt ? course.expiresAt.toISOString() : null} />
          </span>
          <ReportExpiredButton courseId={course.id} />
        </div>
      </div>
    </article>
  )
}
