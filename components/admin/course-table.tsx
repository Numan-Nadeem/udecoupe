"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  bulkCourseAction,
  deleteCourse,
  setCourseFlag,
} from "@/app/admin/(panel)/courses/actions"

interface CourseRow {
  id: number
  title: string
  category: string | null
  difficulty: string | null
  isActive: boolean | null
  isFlagged: boolean | null
  expiresAt: string | null
  createdAt: string | null
}

export function CourseTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<number[]>([])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const allSelected = courses.length > 0 && selected.length === courses.length

  function toggleAll(checked: boolean) {
    setSelected(checked ? courses.map((c) => c.id) : [])
  }

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  function runBulk(op: "activate" | "deactivate" | "delete") {
    if (op === "delete" && !window.confirm(`Delete ${selected.length} selected course(s)? This cannot be undone.`)) {
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await bulkCourseAction(selected, op)
      if (res.error) setError(res.error)
      setSelected([])
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

  function handleFlag(id: number, flagged: boolean) {
    setError(null)
    startTransition(async () => {
      const res = await setCourseFlag(id, flagged)
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

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">{selected.length} selected</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("activate")}
            className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:opacity-80 disabled:opacity-50"
          >
            Activate
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("deactivate")}
            className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:opacity-80 disabled:opacity-50"
          >
            Deactivate
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("delete")}
            className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  aria-label="Select all courses"
                />
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">ID</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Category</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Difficulty</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Expires</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No courses found.
                </td>
              </tr>
            )}
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(course.id)}
                    onChange={(e) => toggleOne(course.id, e.target.checked)}
                    aria-label={`Select ${course.title}`}
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{course.id}</td>
                <td className="max-w-[280px] truncate px-4 py-3 font-medium text-foreground" title={course.title}>
                  {course.title}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{course.category ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{course.difficulty ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        course.isActive
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                    {course.isFlagged && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        Flagged
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {course.expiresAt ? new Date(course.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleFlag(course.id, !course.isFlagged)}
                      className="font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {course.isFlagged ? "Unflag" : "Flag"}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(course.id, course.title)}
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
