import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/lib/queries"
import { StarRating } from "@/components/star-rating"
import { ExpiryCountdown } from "@/components/expiry-countdown"
import { ReportExpiredButton } from "@/components/report-expired-button"
import { categoryBadgeClass, formatStudents } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    return { title: "Course not found" }
  }

  const desc = (course.descriptionEnriched || course.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160)
  const canonical = `${baseUrl}/courses/${course.slug}`

  return {
    title: course.title,
    description: desc || `Get ${course.title} free on Udemy with an active coupon.`,
    alternates: { canonical },
    openGraph: {
      title: course.title,
      description: desc,
      url: canonical,
      type: "article",
      images: course.thumbnailUrl ? [{ url: course.thumbnailUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: desc,
      images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
    },
  }
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) notFound()

  if (!course.isActive) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-foreground">This coupon has expired</h1>
        <p className="mt-2 text-muted-foreground">
          Unfortunately this offer is no longer available. Browse other free courses with active coupons.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
        >
          Browse free courses
        </Link>
      </div>
    )
  }

  const description = course.descriptionEnriched || course.description || ""

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: description.replace(/\s+/g, " ").trim().slice(0, 500),
    provider: { "@type": "Organization", name: "Udemy", sameAs: "https://www.udemy.com" },
    image: course.thumbnailUrl || undefined,
    ...(course.instructor && {
      instructor: { "@type": "Person", name: course.instructor },
    }),
    ...(course.rating && course.totalStudents
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(course.rating),
            ratingCount: course.totalStudents,
            bestRating: 5,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      category: "Free",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/LimitedAvailability",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-foreground">
            Courses
          </Link>
          <span className="mx-2">/</span>
          {course.category && (
            <>
              <Link href={`/?category=${encodeURIComponent(course.category)}`} className="transition hover:text-foreground">
                {course.category}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-foreground">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${categoryBadgeClass(course.category)}`}>
                  {course.category}
                </span>
              )}
              {course.difficulty && (
                <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {course.difficulty}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              {course.title}
            </h1>

            {course.instructor && (
              <p className="mt-2 text-muted-foreground">
                Created by <span className="font-semibold text-foreground">{course.instructor}</span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <StarRating rating={course.rating} />
              {course.totalStudents ? (
                <span className="text-muted-foreground">
                  {formatStudents(course.totalStudents)} students enrolled
                </span>
              ) : null}
            </div>

            <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_16px_40px_-20px_color-mix(in_oklch,var(--primary)_30%,transparent)]">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
              )}
            </div>

            {description && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-foreground">About this course</h2>
                <div className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
                  {description}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / CTA */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.75rem] border border-border bg-secondary/50 p-1.5">
            <div className="rounded-[calc(1.75rem-0.375rem)] bg-card p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_12px_32px_-16px_color-mix(in_oklch,var(--primary)_25%,transparent)]">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground">Free</span>
                <span className="text-sm text-muted-foreground line-through">with coupon</span>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-primary" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="font-medium text-secondary-foreground">Coupon expires in</span>
                <ExpiryCountdown
                  expiresAt={course.expiresAt ? course.expiresAt.toISOString() : null}
                  precise
                  className="ml-auto font-bold"
                />
              </div>

              {course.couponCode && (
                <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-3 py-3 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Coupon code
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold tracking-[0.15em] text-primary">
                    {course.couponCode}
                  </p>
                </div>
              )}

              <a
                href={`/go/${course.slug}`}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-full bg-accent py-2.5 pl-6 pr-2.5 text-base font-bold text-accent-foreground shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-95 active:scale-[0.98]"
              >
                Get Free Course
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-foreground/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-0.5 group-hover:scale-105">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Redirects to Udemy. Coupon applied automatically.
              </p>

              <div className="mt-4 border-t border-border pt-4 text-center">
                <ReportExpiredButton courseId={course.id} className="mx-auto" />
              </div>
            </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
