import Link from "next/link"

export function AdminPagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number
  totalPages: number
  basePath: string
  params: Record<string, string | string[] | undefined>
}) {
  if (totalPages <= 1) return null

  function href(p: number) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === "string" && v && k !== "page") sp.set(k, v)
    }
    sp.set("page", String(p))
    return `${basePath}?${sp.toString()}`
  }

  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <div>
        {page > 1 && (
          <Link
            href={href(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Previous
          </Link>
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div>
        {page < totalPages && (
          <Link
            href={href(page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  )
}
