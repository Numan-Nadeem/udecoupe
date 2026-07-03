import { db } from "@/lib/db"
import { settings } from "@/lib/schema"
import { inArray } from "drizzle-orm"
import { SettingsForm } from "@/components/admin/settings-form"
import { PasswordForm } from "@/components/admin/password-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, ["affiliate_id", "digest_enabled", "digest_hour_utc"]))

  const map = new Map(rows.map((r) => [r.key, r.value ?? ""]))

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Site configuration and admin credentials.</p>
      </div>

      <SettingsForm
        affiliateId={map.get("affiliate_id") ?? ""}
        digestEnabled={map.get("digest_enabled") !== "false"}
        digestHourUtc={Number.parseInt(map.get("digest_hour_utc") ?? "9", 10) || 9}
      />

      <PasswordForm />
    </div>
  )
}
