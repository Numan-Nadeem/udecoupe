"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { CourseFormState } from "@/app/admin/(panel)/courses/actions"
import { CATEGORIES, DIFFICULTIES } from "@/lib/categories"

export interface CourseFormValues {
  title?: string
  description?: string | null
  instructor?: string | null
  category?: string | null
  difficulty?: string | null
  thumbnailUrl?: string | null
  rating?: string | null
  totalStudents?: number | null
  couponCode?: string | null
  couponUrl?: string
  expiresAt?: string | null // datetime-local value
  isActive?: boolean | null
}

const initialState: CourseFormState = { error: null }

function defaultExpiry(): string {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function CourseForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prev: CourseFormState, formData: FormData) => Promise<CourseFormState>
  defaults?: CourseFormValues
  submitLabel: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success) {
      router.push("/admin/courses")
      router.refresh()
    }
  }, [state.success, router])

  const inputClass =
    "rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={300}
          defaultValue={defaults?.title ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={5000}
          defaultValue={defaults?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="instructor" className="text-sm font-medium text-foreground">
            Instructor
          </label>
          <input
            id="instructor"
            name="instructor"
            maxLength={200}
            defaultValue={defaults?.instructor ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={defaults?.category ?? ""}
            className={inputClass}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Difficulty</legend>
        <div className="flex flex-wrap gap-4">
          {DIFFICULTIES.map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="difficulty"
                value={d}
                defaultChecked={defaults?.difficulty === d}
              />
              {d}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="radio"
              name="difficulty"
              value=""
              defaultChecked={!defaults?.difficulty}
            />
            None
          </label>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="thumbnailUrl" className="text-sm font-medium text-foreground">
          Thumbnail URL
        </label>
        <input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          maxLength={2000}
          defaultValue={defaults?.thumbnailUrl ?? ""}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rating" className="text-sm font-medium text-foreground">
            Rating (0–5)
          </label>
          <input
            id="rating"
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            defaultValue={defaults?.rating ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="totalStudents" className="text-sm font-medium text-foreground">
            Total students
          </label>
          <input
            id="totalStudents"
            name="totalStudents"
            type="number"
            min="0"
            step="1"
            defaultValue={defaults?.totalStudents ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="couponCode" className="text-sm font-medium text-foreground">
            Coupon code <span className="text-destructive">*</span>
          </label>
          <input
            id="couponCode"
            name="couponCode"
            required
            maxLength={100}
            pattern="[A-Za-z0-9._\-]+"
            title="Alphanumeric characters, dots, dashes and underscores only"
            defaultValue={defaults?.couponCode ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expiresAt" className="text-sm font-medium text-foreground">
            Expires at <span className="text-destructive">*</span>
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            required
            defaultValue={defaults?.expiresAt ?? defaultExpiry()}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="couponUrl" className="text-sm font-medium text-foreground">
          Coupon URL <span className="text-destructive">*</span>
        </label>
        <input
          id="couponUrl"
          name="couponUrl"
          type="url"
          required
          maxLength={2000}
          defaultValue={defaults?.couponUrl ?? ""}
          placeholder="https://www.udemy.com/course/...?couponCode=..."
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaults?.isActive ?? true}
        />
        Active (visible on the public site)
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
