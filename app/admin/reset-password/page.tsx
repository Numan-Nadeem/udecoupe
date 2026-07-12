import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password — Admin",
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams

  // A missing token renders an error state — no redirect that leaks timing.
  if (!token || token.length < 10) {
    redirect("/admin/forgot-password")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Reset Password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a new admin password (min. 12 characters)
            </p>
          </div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </main>
  )
}
