"use client"

import Link from "next/link"
import { useActionState } from "react"
import { requestResetAction, type ForgotPasswordState } from "./actions"

const initialState: ForgotPasswordState = { error: null, success: false }

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestResetAction, initialState)

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="rounded-lg bg-primary/10 px-4 py-4 text-sm text-primary">
          <p className="font-semibold">Check your email</p>
          <p className="mt-1 text-muted-foreground">
            If that email is registered, a reset link has been sent. It expires in 15 minutes.
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
          placeholder="noman.mughal256@gmail.com"
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
        {pending ? "Sending..." : "Send reset link"}
      </button>

      <Link
        href="/admin/login"
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Back to login
      </Link>
    </form>
  )
}
