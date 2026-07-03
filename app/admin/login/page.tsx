import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Udecoupe Admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage the site
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
