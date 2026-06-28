import Link from "next/link"

type Variant = "success" | "error"

export function StatusPage({
  variant,
  title,
  message,
}: {
  variant: Variant
  title: string
  message: string
}) {
  const isSuccess = variant === "success"
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          isSuccess ? "bg-[oklch(0.95_0.05_160)] text-[oklch(0.45_0.15_160)]" : "bg-secondary text-destructive"
        }`}
      >
        {isSuccess ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        )}
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">{message}</p>
      <Link
        href="/"
        className="mt-7 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
      >
        Browse free courses
      </Link>
    </main>
  )
}
