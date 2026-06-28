import type { MetadataRoute } from "next"
import { getActiveCourseSlugs } from "@/lib/queries"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ]

  try {
    const courses = await getActiveCourseSlugs()
    const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${baseUrl}/courses/${c.slug}`,
      lastModified: c.updatedAt ?? new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    }))
    return [...staticRoutes, ...courseRoutes]
  } catch (err) {
    console.error("[v0] sitemap generation failed:", err)
    return staticRoutes
  }
}
