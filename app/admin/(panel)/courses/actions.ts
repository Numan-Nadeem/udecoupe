"use server"

import { z } from "zod"
import { and, eq, ne, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { courses } from "@/lib/schema"
import { requireAdmin } from "@/lib/session"
import { logAuditEvent } from "@/lib/audit"
import { buildAffiliateUrl, getAffiliateId } from "@/lib/affiliate"
import { CATEGORIES, DIFFICULTIES } from "@/lib/categories"

const courseSchema = z.object({
  title: z.string().trim().min(3).max(300),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  instructor: z.string().trim().max(200).optional().or(z.literal("")),
  category: z.enum(CATEGORIES).optional().or(z.literal("")),
  difficulty: z.enum(DIFFICULTIES).optional().or(z.literal("")),
  thumbnailUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  rating: z.coerce.number().min(0).max(5).optional(),
  totalStudents: z.coerce.number().int().min(0).max(100_000_000).optional(),
  couponCode: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9._-]+$/, "Coupon code must be alphanumeric"),
  couponUrl: z.string().trim().url().max(2000),
  expiresAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  isActive: z.boolean(),
})

export interface CourseFormState {
  error: string | null
  success?: boolean
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
}

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let candidate = base || "course"
  let i = 1
  // Bounded loop to guarantee termination.
  while (i < 50) {
    const existing = await db.query.courses.findFirst({
      where: excludeId
        ? and(eq(courses.slug, candidate), ne(courses.id, excludeId))
        : eq(courses.slug, candidate),
      columns: { id: true },
    })
    if (!existing) return candidate
    i += 1
    candidate = `${base}-${i}`
  }
  return `${base}-${Date.now()}`
}

/** Validate that a thumbnail URL actually serves an image (HEAD request). */
async function validateThumbnail(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    })
    if (!res.ok) return false
    const ct = res.headers.get("content-type") || ""
    return ct.startsWith("image/")
  } catch {
    return false
  }
}

function parseForm(formData: FormData) {
  return courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    instructor: formData.get("instructor") || "",
    category: formData.get("category") || "",
    difficulty: formData.get("difficulty") || "",
    thumbnailUrl: formData.get("thumbnailUrl") || "",
    rating: formData.get("rating") || undefined,
    totalStudents: formData.get("totalStudents") || undefined,
    couponCode: formData.get("couponCode"),
    couponUrl: formData.get("couponUrl"),
    expiresAt: formData.get("expiresAt"),
    isActive: formData.get("isActive") === "on",
  })
}

export async function createCourse(
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const data = parsed.data

  // Coupon URL uniqueness
  const dupe = await db.query.courses.findFirst({
    where: eq(courses.couponUrl, data.couponUrl),
    columns: { id: true },
  })
  if (dupe) return { error: "A course with this coupon URL already exists." }

  // Thumbnail content-type validation (only if provided)
  if (data.thumbnailUrl) {
    const ok = await validateThumbnail(data.thumbnailUrl)
    if (!ok) return { error: "Thumbnail URL does not point to a valid image." }
  }

  const slug = await uniqueSlug(slugify(data.title))
  const affiliateId = await getAffiliateId()

  const [inserted] = await db
    .insert(courses)
    .values({
      title: data.title,
      slug,
      description: data.description || null,
      instructor: data.instructor || null,
      category: data.category || null,
      difficulty: data.difficulty || null,
      thumbnailUrl: data.thumbnailUrl || null,
      rating: data.rating != null ? String(data.rating) : null,
      totalStudents: data.totalStudents ?? null,
      couponCode: data.couponCode,
      couponUrl: data.couponUrl,
      affiliateUrl: buildAffiliateUrl(data.couponUrl, affiliateId || null),
      expiresAt: new Date(data.expiresAt),
      isActive: data.isActive,
      isFlagged: false,
      source: "manual",
    })
    .returning({ id: courses.id })

  await logAuditEvent("create", "courses", inserted.id, {
    title: data.title,
    slug,
    category: data.category || null,
    couponCode: data.couponCode,
    couponUrl: data.couponUrl,
    expiresAt: data.expiresAt,
    isActive: data.isActive,
  })

  revalidatePath("/admin/courses")
  revalidatePath("/")
  return { error: null, success: true }
}

export async function updateCourse(
  id: number,
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  if (!Number.isInteger(id) || id <= 0) return { error: "Invalid course id" }

  const existing = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  if (!existing) return { error: "Course not found" }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const data = parsed.data

  // Coupon URL uniqueness if changed
  if (data.couponUrl !== existing.couponUrl) {
    const dupe = await db.query.courses.findFirst({
      where: and(eq(courses.couponUrl, data.couponUrl), ne(courses.id, id)),
      columns: { id: true },
    })
    if (dupe) return { error: "Another course already uses this coupon URL." }
  }

  if (data.thumbnailUrl && data.thumbnailUrl !== existing.thumbnailUrl) {
    const ok = await validateThumbnail(data.thumbnailUrl)
    if (!ok) return { error: "Thumbnail URL does not point to a valid image." }
  }

  // Re-slug if the title changed
  let slug = existing.slug
  if (data.title !== existing.title) {
    slug = await uniqueSlug(slugify(data.title), id)
  }

  const affiliateId = await getAffiliateId()

  const next = {
    title: data.title,
    slug,
    description: data.description || null,
    instructor: data.instructor || null,
    category: data.category || null,
    difficulty: data.difficulty || null,
    thumbnailUrl: data.thumbnailUrl || null,
    rating: data.rating != null ? String(data.rating) : null,
    totalStudents: data.totalStudents ?? null,
    couponCode: data.couponCode,
    couponUrl: data.couponUrl,
    affiliateUrl: buildAffiliateUrl(data.couponUrl, affiliateId || null),
    expiresAt: new Date(data.expiresAt),
    isActive: data.isActive,
  }

  // Diff only changed fields for the audit trail
  const changed: Record<string, { from: unknown; to: unknown }> = {}
  for (const [key, value] of Object.entries(next)) {
    const prev = (existing as Record<string, unknown>)[key]
    const prevCmp = prev instanceof Date ? prev.toISOString() : prev
    const valCmp = value instanceof Date ? value.toISOString() : value
    if (String(prevCmp ?? "") !== String(valCmp ?? "")) {
      changed[key] = { from: prevCmp ?? null, to: valCmp ?? null }
    }
  }

  await db
    .update(courses)
    .set({ ...next, updatedAt: new Date() })
    .where(eq(courses.id, id))

  if (Object.keys(changed).length > 0) {
    await logAuditEvent("update", "courses", id, changed)
  }

  revalidatePath("/admin/courses")
  revalidatePath("/")
  revalidatePath(`/courses/${slug}`)
  return { error: null, success: true }
}

export async function deleteCourse(id: number): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }
  if (!Number.isInteger(id) || id <= 0) return { error: "Invalid course id" }

  const existing = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  if (!existing) return { error: "Course not found" }

  await db.delete(courses).where(eq(courses.id, id))

  await logAuditEvent("delete", "courses", id, {
    title: existing.title,
    slug: existing.slug,
    category: existing.category,
    couponCode: existing.couponCode,
    couponUrl: existing.couponUrl,
    isActive: existing.isActive,
  })

  revalidatePath("/admin/courses")
  revalidatePath("/")
  return { error: null }
}

const bulkSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
  op: z.enum(["activate", "deactivate", "delete"]),
})

export async function bulkCourseAction(
  ids: number[],
  op: "activate" | "deactivate" | "delete",
): Promise<{ error: string | null; affected: number }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized", affected: 0 }
  }

  const parsed = bulkSchema.safeParse({ ids, op })
  if (!parsed.success) return { error: "Invalid bulk request", affected: 0 }

  const { ids: validIds, op: validOp } = parsed.data

  if (validOp === "delete") {
    const rows = await db
      .select({ id: courses.id, title: courses.title })
      .from(courses)
      .where(inArray(courses.id, validIds))
    await db.delete(courses).where(inArray(courses.id, validIds))
    for (const row of rows) {
      await logAuditEvent("delete", "courses", row.id, { title: row.title, bulk: true })
    }
    revalidatePath("/admin/courses")
    revalidatePath("/")
    return { error: null, affected: rows.length }
  }

  const isActive = validOp === "activate"
  const rows = await db
    .update(courses)
    .set({ isActive, updatedAt: new Date() })
    .where(inArray(courses.id, validIds))
    .returning({ id: courses.id })
  for (const row of rows) {
    await logAuditEvent("update", "courses", row.id, {
      isActive: { to: isActive },
      bulk: true,
    })
  }
  revalidatePath("/admin/courses")
  revalidatePath("/")
  return { error: null, affected: rows.length }
}

export async function setCourseFlag(
  id: number,
  flagged: boolean,
): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
  } catch {
    return { error: "Unauthorized" }
  }
  if (!Number.isInteger(id) || id <= 0) return { error: "Invalid course id" }

  const existing = await db.query.courses.findFirst({
    where: eq(courses.id, id),
    columns: { id: true },
  })
  if (!existing) return { error: "Course not found" }

  await db
    .update(courses)
    .set(
      flagged
        ? { isFlagged: true, updatedAt: new Date() }
        : { isFlagged: false, expiredReports: 0, updatedAt: new Date() },
    )
    .where(eq(courses.id, id))

  await logAuditEvent("update", "courses", id, { isFlagged: { to: flagged } })

  revalidatePath("/admin/courses")
  revalidatePath("/admin/flagged")
  return { error: null }
}
