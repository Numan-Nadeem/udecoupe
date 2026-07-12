"use client"

import Link from "next/link"
import { useActionState } from "react"
import { resetPasswordAction, type ResetPasswordState } from "@/app/admin/forgot-password/actions"

const initialState: ResetPasswordState = { error: null, success: false }

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState)

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="rounded-lg bg-primary/10 px-4 py-4 text-sm text-primary">
          <p className="font-semibold">Password reset submitted</p>
          <p className="mt-1 text-muted-foreground">
            Your new <code>ADMIN_PASSWORD_HASH</code> has been sent to your email. Copy it into
            your Vercel environment variables and redeploy to activate the new password.
          </p>
        </div>
        <Link
          href="/admin/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Hidden token field — not exposed in URL on submit */}
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
          placeholder="At least 12 characters"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-sm font-medium text-foreground">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
          placeholder="Repeat your new password"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Resetting..." : "Set new password"}
      </button>
    </form>
  )
}
