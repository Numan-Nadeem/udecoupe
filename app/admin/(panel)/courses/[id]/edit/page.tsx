import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { courses } from "@/lib/schema"
import { CourseForm } from "@/components/admin/course-form"
import { updateCourse } from "../../actions"

export const metadata = { title: "Edit Course" }
export const dynamic = "force-dynamic"

function toDatetimeLocal(date: Date | null): string | null {
  if (!date) return null
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number.parseInt(idParam, 10)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const course = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  if (!course) notFound()

  const boundUpdate = updateCourse.bind(null, id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Edit course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editing #{course.id}: {course.title}
        </p>
      </div>
      <CourseForm
        action={boundUpdate}
        submitLabel="Save changes"
        defaults={{
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          category: course.category,
          difficulty: course.difficulty,
          thumbnailUrl: course.thumbnailUrl,
          rating: course.rating,
          totalStudents: course.totalStudents,
          couponCode: course.couponCode,
          couponUrl: course.couponUrl,
          expiresAt: toDatetimeLocal(course.expiresAt),
          isActive: course.isActive,
        }}
      />
    </div>
  )
}
