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
          className="flex-1 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-primary-foreground/40 focus:bg-primary-foreground/15 focus:ring-2 focus:ring-primary-foreground/20"
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
          className="group flex items-center justify-center gap-2 rounded-full bg-accent py-2 pl-6 pr-2 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing…" : "Notify me"}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-foreground/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-0.5 group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
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
