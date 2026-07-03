import type { Metadata } from "next"
import { inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { settings } from "@/lib/schema"
import { SettingsForm } from "@/components/admin/settings-form"

export const metadata: Metadata = {
  title: "Settings",
}

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, ["affiliate_id", "default_coupon_ttl_days", "email_digest_enabled"]))

  const map = new Map(rows.map((r) => [r.key, r.value]))

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global configuration for affiliate links, coupon lifetime, and email digests.
        </p>
      </div>
      <SettingsForm
        affiliateId={map.get("affiliate_id") ?? ""}
        couponTtlDays={map.get("default_coupon_ttl_days") ?? "3"}
        digestEnabled={(map.get("email_digest_enabled") ?? "true") !== "false"}
      />
    </div>
  )
}
