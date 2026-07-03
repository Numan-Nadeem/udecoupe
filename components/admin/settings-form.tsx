"use client"

import { useState, useTransition } from "react"
import { updateSettings } from "@/app/admin/(panel)/settings/actions"

export function SettingsForm({
  affiliateId,
  couponTtlDays,
  digestEnabled,
}: {
  affiliateId: string
  couponTtlDays: string
  digestEnabled: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await updateSettings(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSaved(true)
      }
    })
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="affiliateId" className="text-sm font-semibold text-foreground">
          Udemy Affiliate ID
        </label>
        <input
          id="affiliateId"
          name="affiliateId"
          defaultValue={affiliateId}
          maxLength={100}
          placeholder="Optional — overrides UDEMY_AFFILIATE_ID env var"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Appended to coupon URLs as <code className="font-mono">referralCode</code>. Leave empty to use the
          environment variable.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="couponTtlDays" className="text-sm font-semibold text-foreground">
          Default Coupon TTL (days)
        </label>
        <input
          id="couponTtlDays"
          name="couponTtlDays"
          type="number"
          min={1}
          max={30}
          required
          defaultValue={couponTtlDays}
          className="h-10 w-32 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Used by the cron agent when a coupon has no explicit expiry date.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="digestEnabled"
          name="digestEnabled"
          type="checkbox"
          defaultChecked={digestEnabled}
          className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
        />
        <div className="flex flex-col gap-0.5">
          <label htmlFor="digestEnabled" className="text-sm font-semibold text-foreground">
            Email Digest Enabled
          </label>
          <p className="text-xs text-muted-foreground">
            When enabled, the cron agent sends new-coupon digests to verified subscribers.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          Settings saved.
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  )
}
