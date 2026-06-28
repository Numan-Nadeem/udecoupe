import { db } from "./db"
import { courses, couponClicks } from "./schema"
import { and, asc, desc, eq, ilike, or, sql, count } from "drizzle-orm"

export type SortOption = "newest" | "expiring" | "rating"

const PAGE_SIZE = 10

export async function getCourses({
  page = 1,
  search = "",
  category = "",
  difficulty = "",
  sort = "newest",
}: {
  page?: number
  search?: string
  category?: string
  difficulty?: string
  sort?: SortOption
}) {
  const offset = (page - 1) * PAGE_SIZE

  const conditions = [eq(courses.isActive, true)]

  if (search) {
    const term = `%${search}%`
    conditions.push(
      or(ilike(courses.title, term), ilike(courses.instructor, term), ilike(courses.category, term))!,
    )
  }
  if (category) conditions.push(eq(courses.category, category))
  if (difficulty) conditions.push(eq(courses.difficulty, difficulty))

  const whereClause = and(...conditions)

  let orderBy
  if (sort === "expiring") {
    orderBy = asc(courses.expiresAt)
  } else if (sort === "rating") {
    orderBy = desc(courses.rating)
  } else {
    orderBy = desc(courses.createdAt)
  }

  const [results, totalResult] = await Promise.all([
    db.select().from(courses).where(whereClause).orderBy(orderBy).limit(PAGE_SIZE).offset(offset),
    db.select({ value: count() }).from(courses).where(whereClause),
  ])

  const total = totalResult[0]?.value ?? 0

  return {
    courses: results,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
  }
}

export async function getCourseBySlug(slug: string) {
  return db.query.courses.findFirst({
    where: eq(courses.slug, slug),
  })
}

export async function getFilterOptions() {
  const [cats, diffs] = await Promise.all([
    db
      .selectDistinct({ category: courses.category })
      .from(courses)
      .where(and(eq(courses.isActive, true), sql`${courses.category} is not null`)),
    db
      .selectDistinct({ difficulty: courses.difficulty })
      .from(courses)
      .where(and(eq(courses.isActive, true), sql`${courses.difficulty} is not null`)),
  ])

  return {
    categories: cats.map((c) => c.category).filter(Boolean) as string[],
    difficulties: diffs.map((d) => d.difficulty).filter(Boolean) as string[],
  }
}

export async function logCourseClick(
  courseId: number,
  ipHash: string,
  userAgent: string,
  category: string | null,
) {
  await db.insert(couponClicks).values({
    courseId,
    ipHash,
    userAgent,
    category,
    clickedAt: new Date(),
  })
}

export async function incrementExpiredReports(courseId: number) {
  await db
    .update(courses)
    .set({ expiredReports: sql`${courses.expiredReports} + 1` })
    .where(eq(courses.id, courseId))
}

export async function getActiveCourseSlugs() {
  return db
    .select({ slug: courses.slug, updatedAt: courses.updatedAt })
    .from(courses)
    .where(eq(courses.isActive, true))
}
