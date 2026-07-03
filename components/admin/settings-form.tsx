"use client"

import { useActionState } from "react"
import { saveSettings, type SettingsFormState } from "@/app/admin/(panel)/settings/actions"

const initialState: SettingsFormState = {}

export function SettingsForm({
  affiliateId,
  digestEnabled,
  digestHourUtc,
}: {
  affiliateId: string
  digestEnabled: boolean
  digestHourUtc: number
}) {
  const [state, formAction, isPending] = useActionState(saveSettings, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-bold text-foreground">Site configuration</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="affiliateId" className="text-sm font-semibold text-foreground">
          Udemy affiliate ID
        </label>
        <input
          id="affiliateId"
          name="affiliateId"
          defaultValue={affiliateId}
          maxLength={120}
          placeholder="your-affiliate-id"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Used to build affiliate URLs for new courses. Leave empty to use plain coupon links.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="digestEnabled" className="text-sm font-semibold text-foreground">
          Daily email digest
        </label>
        <select
          id="digestEnabled"
          name="digestEnabled"
          defaultValue={digestEnabled ? "true" : "false"}
          className="w-full max-w-48 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="digestHourUtc" className="text-sm font-semibold text-foreground">
          Digest send hour (UTC)
        </label>
        <input
          id="digestHourUtc"
          name="digestHourUtc"
          type="number"
          min={0}
          max={23}
          defaultValue={digestHourUtc}
          className="w-full max-w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">Hour of day (0–23) when the daily digest is sent.</p>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm font-medium text-primary">Settings saved.</p>}

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
