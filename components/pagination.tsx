import Link from "next/link"

export function Pagination({
  page,
  pages,
  searchParams,
}: {
  page: number
  pages: number
  searchParams: Record<string, string | undefined>
}) {
  if (pages <= 1) return null

  function hrefFor(p: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value)
    }
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return qs ? `/?${qs}` : "/"
  }

  // Build a compact window of page numbers
  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  const end = Math.min(pages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const baseBtn =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${baseBtn} border-border bg-card text-foreground hover:bg-secondary hover:border-primary/25`}>
          Previous
        </Link>
      ) : (
        <span className={`${baseBtn} cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50`}>
          Previous
        </span>
      )}

      {start > 1 && <span className="px-1 text-muted-foreground">…</span>}

      {numbers.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-current={n === page ? "page" : undefined}
          className={
            n === page
              ? `${baseBtn} border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-6px_color-mix(in_oklch,var(--primary)_40%,transparent)]`
              : `${baseBtn} border-border bg-card text-foreground hover:bg-secondary hover:border-primary/25`
          }
        >
          {n}
        </Link>
      ))}

      {end < pages && <span className="px-1 text-muted-foreground">…</span>}

      {page < pages ? (
        <Link href={hrefFor(page + 1)} className={`${baseBtn} border-border bg-card text-foreground hover:bg-secondary hover:border-primary/25`}>
          Next
        </Link>
      ) : (
        <span className={`${baseBtn} cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50`}>
          Next
        </span>
      )}
    </nav>
  )
}
