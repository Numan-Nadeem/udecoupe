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
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/40 hover:bg-secondary/80"
          >
            Previous
          </Link>
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div>
        {page < totalPages && (
          <Link
            href={href(page + 1)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/40 hover:bg-secondary/80"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  )
}
