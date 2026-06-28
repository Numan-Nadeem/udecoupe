import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/", "/verify", "/unsubscribe", "/subscribe"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
