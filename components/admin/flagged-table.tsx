"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteCourse, setCourseFlag } from "@/app/admin/(panel)/courses/actions"

interface FlaggedRow {
  id: number
  title: string
  isFlagged: boolean | null
  expiredReports: number | null
  isActive: boolean | null
  createdAt: string | null
}

export function FlaggedTable({ courses }: { courses: FlaggedRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleUnflag(id: number) {
    setError(null)
    startTransition(async () => {
      const res = await setCourseFlag(id, false)
      if (res.error) setError(res.error)
      router.refresh()
    })
  }

  function handleDelete(id: number, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setError(null)
    startTransition(async () => {
      const res = await deleteCourse(id)
      if (res.error) setError(res.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-semibold text-muted-foreground">ID</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Flagged</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Expired reports</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nothing awaiting review.
                </td>
              </tr>
            )}
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{c.id}</td>
                <td className="max-w-[320px] truncate px-4 py-3 font-medium text-foreground" title={c.title}>
                  {c.title}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.isFlagged ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.expiredReports ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.isActive ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleUnflag(c.id)}
                      className="font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      Unflag
                    </button>
                    <Link
                      href={`/admin/courses/${c.id}/edit`}
                      className="font-medium text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(c.id, c.title)}
                      className="font-medium text-destructive hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
