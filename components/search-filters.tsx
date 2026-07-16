"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { CustomSelect } from "./custom-select"

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
          className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-card-foreground shadow-sm outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Search courses"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <CustomSelect
          value={category}
          onChange={(value) => update({ category: value })}
          options={[
            { value: "", label: "All categories" },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
          placeholder="All categories"
          className="w-full sm:w-auto"
        />

        <CustomSelect
          value={difficulty}
          onChange={(value) => update({ difficulty: value })}
          options={[
            { value: "", label: "All levels" },
            ...difficulties.map((d) => ({ value: d, label: d })),
          ]}
          placeholder="All levels"
          className="w-full sm:w-auto"
        />

        <CustomSelect
          value={sort}
          onChange={(value) => update({ sort: value })}
          options={[
            { value: "newest", label: "Newest" },
            { value: "expiring", label: "Expiring soon" },
            { value: "rating", label: "Highest rated" },
          ]}
          placeholder="Sort by"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  )
}
