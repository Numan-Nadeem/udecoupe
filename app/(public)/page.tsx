import { Suspense } from "react"
import { getCourses, getFilterOptions, type SortOption } from "@/lib/queries"
import { CourseCard } from "@/components/course-card"
import { SearchFilters } from "@/components/search-filters"
import { Pagination } from "@/components/pagination"
import { SubscribeForm } from "@/components/subscribe-form"

export const dynamic = "force-dynamic"

type SearchParams = {
  page?: string
  search?: string
  category?: string
  difficulty?: string
  sort?: string
}

function parseSort(value?: string): SortOption {
  return value === "expiring" || value === "rating" ? value : "newest"
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1)
  const search = sp.search ?? ""
  const category = sp.category ?? ""
  const difficulty = sp.difficulty ?? ""
  const sort = parseSort(sp.sort)

  const [{ courses, total, pages }, filterOptions] = await Promise.all([
    getCourses({ page, search, category, difficulty, sort }),
    getFilterOptions(),
  ])

  const hasFilters = Boolean(search || category || difficulty)

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Updated daily · {total.toLocaleString()} active coupons
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Free Udemy courses with{" "}
              <span className="text-primary">active coupons</span>
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Hand-picked, verified course coupons across development, design, business and more.
              Grab them before they expire.
            </p>
          </div>
        </div>
      </section>

      {/* Listing */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense fallback={<div className="h-12" />}>
          <SearchFilters categories={filterOptions.categories} difficulties={filterOptions.difficulties} />
        </Suspense>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {hasFilters ? (
              <>
                {total.toLocaleString()} {total === 1 ? "result" : "results"}
                {search && (
                  <>
                    {" "}for <span className="font-semibold text-foreground">&ldquo;{search}&rdquo;</span>
                  </>
                )}
              </>
            ) : (
              <>Showing the latest free courses</>
            )}
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">No courses found</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filters — new coupons are added every day."
                : "No active coupons right now. Check back soon or subscribe for alerts."}
            </p>
          </div>
        )}

        <Pagination page={page} pages={pages} searchParams={sp} />
      </section>

      {/* Subscribe CTA */}
      <section id="subscribe" className="scroll-mt-20 border-t border-border bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <h2 className="text-balance text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl">
              Never miss a free course
            </h2>
            <p className="mt-2 text-pretty leading-relaxed text-primary-foreground/80">
              Get a daily digest of new free Udemy coupons straight to your inbox. No spam,
              unsubscribe anytime.
            </p>
          </div>
          <SubscribeForm />
        </div>
      </section>
    </>
  )
}
