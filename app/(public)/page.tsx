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
      <section className="relative -mt-[4.25rem] overflow-hidden border-b border-border pt-[4.25rem]">
        {/* Blueprint grid texture, dissolving at edges */}
        <div className="bg-grid mask-fade-edges pointer-events-none absolute inset-0" aria-hidden="true" />
        {/* Ambient radial glow anchored top-left */}
        <div
          className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Updated daily
            </span>
            <h1 className="animate-rise animate-rise-1 mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl">
              Free Udemy courses with <span className="text-primary">active coupons</span>
            </h1>
            <p className="animate-rise animate-rise-2 mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Hand-picked, verified course coupons across development, design, business and more.
              Grab them before they expire.
            </p>
            <div className="animate-rise animate-rise-3 mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <p className="tabular-nums text-2xl font-extrabold tracking-tight text-foreground">
                  {total.toLocaleString()}
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Live coupons
                </p>
              </div>
              <div className="h-9 w-px bg-border" aria-hidden="true" />
              <div>
                <p className="tabular-nums text-2xl font-extrabold tracking-tight text-foreground">100%</p>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Off with coupon
                </p>
              </div>
              <div className="h-9 w-px bg-border" aria-hidden="true" />
              <div>
                <p className="tabular-nums text-2xl font-extrabold tracking-tight text-foreground">
                  {filterOptions.categories.length || 12}+
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Categories
                </p>
              </div>
            </div>
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

      {/* Subscribe CTA — double-bezel card */}
      <section id="subscribe" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-border bg-secondary/50 p-1.5 sm:p-2">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
            {/* Ambient glow inside the card */}
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-start gap-8 px-6 py-12 sm:px-10 sm:py-16 md:flex-row md:items-center md:justify-between">
              <div className="max-w-lg">
                <span className="inline-flex rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground/90">
                  Daily digest
                </span>
                <h2 className="mt-4 text-balance text-2xl font-extrabold tracking-[-0.02em] text-primary-foreground sm:text-4xl">
                  Never miss a free course
                </h2>
                <p className="mt-3 text-pretty leading-relaxed text-primary-foreground/75">
                  Get new free Udemy coupons straight to your inbox. No spam, unsubscribe anytime.
                </p>
              </div>
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
