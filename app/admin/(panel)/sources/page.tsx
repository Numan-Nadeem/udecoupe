import type { Metadata } from "next"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { rssSources } from "@/lib/schema"
import { SourcesManager } from "@/components/admin/sources-manager"

export const metadata: Metadata = {
  title: "RSS Sources",
}

export const dynamic = "force-dynamic"

export default async function SourcesPage() {
  const rows = await db
    .select({
      id: rssSources.id,
      name: rssSources.name,
      url: rssSources.url,
      isActive: rssSources.isActive,
      lastFetchedAt: rssSources.lastFetchedAt,
      failCount: rssSources.failCount,
    })
    .from(rssSources)
    .orderBy(desc(rssSources.id))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">RSS Sources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Feeds polled by the cron agent for new coupons. {rows.length} configured.
        </p>
      </div>
      <SourcesManager rows={rows} />
    </div>
  )
}
