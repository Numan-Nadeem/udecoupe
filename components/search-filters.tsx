"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function SearchFilters({
  categories,
  difficulties,
}: {
  categories: string[]
  difficulties: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const category = searchParams.get("category") ?? ""
  const difficulty = searchParams.get("difficulty") ?? ""
  const sort = searchParams.get("sort") ?? "newest"

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    // any filter change resets pagination
    params.delete("page")
    return `/?${params.toString()}`
  }

  function update(updates: Record<string, string>) {
    router.push(buildUrl(updates))
  }

  // Debounce search input -> URL
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const t = setTimeout(() => {
      update({ search })
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const selectClass =
    "rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-card-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses, instructors, topics…"
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-card-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Search courses"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => update({ category: e.target.value })}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => update({ difficulty: e.target.value })}
          className={selectClass}
          aria-label="Filter by difficulty"
        >
          <option value="">All levels</option>
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className={selectClass}
          aria-label="Sort courses"
        >
          <option value="newest">Newest</option>
          <option value="expiring">Expiring soon</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>
    </div>
  )
}
