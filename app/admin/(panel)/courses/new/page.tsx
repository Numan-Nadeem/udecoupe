import { CourseForm } from "@/components/admin/course-form"
import { createCourse } from "../actions"

export const metadata = { title: "Add Course" }

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Add course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manually add a new coupon course. It will be marked as source &quot;manual&quot;.
        </p>
      </div>
      <CourseForm action={createCourse} submitLabel="Create course" />
    </div>
  )
}
