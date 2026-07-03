import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { subscribers } from "@/lib/schema"
import { getSession } from "@/lib/session"

export const dynamic = "force-dynamic"

/** Escape a CSV field: quote it and double any embedded quotes. */
function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn || session.userId !== "admin") {
    return new Response("Unauthorized", { status: 401 })
  }

  const rows = await db
    .select({
      email: subscribers.email,
      isVerified: subscribers.isVerified,
      subscribedAt: subscribers.subscribedAt,
    })
    .from(subscribers)
    .orderBy(desc(subscribers.subscribedAt))

  const lines = [["Email", "Verified", "Subscribed At"].map(csvField).join(",")]
  for (const row of rows) {
    lines.push(
      [
        csvField(row.email),
        csvField(row.isVerified ? "Yes" : "No"),
        csvField(row.subscribedAt ? row.subscribedAt.toISOString() : ""),
      ].join(","),
    )
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
