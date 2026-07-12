import type { Metadata } from "next"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password — Admin",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Forgot Password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the owner email to receive a reset link
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  )
}
