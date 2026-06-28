"use client"

import { useState } from "react"

type Status = "idle" | "loading" | "success" | "error"

export function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, honeypot }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(data.message || "Check your email for a verification link.")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.message || "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="subscribe-email" className="sr-only">
          Email address
        </label>
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        {/* Honeypot — hidden from users, catches bots */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95 disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing…" : "Notify me"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-destructive" : "text-primary-foreground/90"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  )
}
