"use client"

import Link from "next/link"
import { useActionState } from "react"
import { loginAction, type LoginState } from "./actions"

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
          placeholder="Enter admin password"
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
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <Link
        href="/admin/forgot-password"
        className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        Forgot password?
      </Link>
    </form>
  )
}
