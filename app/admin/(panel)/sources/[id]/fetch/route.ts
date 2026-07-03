import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { rssSources, cronLogs } from "@/lib/schema"
import { requireAdmin } from "@/lib/session"
import { logAuditEvent } from "@/lib/audit"
import { ingestSource, type IngestProgressEvent } from "@/lib/ingest"
import { getAffiliateId } from "@/lib/affiliate"

export const runtime = "nodejs"
export const maxDuration = 300

/**
 * POST /admin/sources/[id]/fetch
 * Manually triggers ingestion for a single RSS source and streams progress
 * as NDJSON lines (one JSON event per line) so the admin UI can show a
 * live log of exactly what is happening, including AI enrichment progress.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idParam } = await params
  const id = Number.parseInt(idParam, 10)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid source id" }, { status: 400 })
  }

  const source = await db.query.rssSources.findFirst({
    where: eq(rssSources.id, id),
  })
  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 })
  }

  const encoder = new TextEncoder()
  const runStartTime = new Date()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: IngestProgressEvent | Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"))
      }

      try {
        const affiliateId = await getAffiliateId()
        const result = await ingestSource(source, affiliateId, (event) => send(event))

        await db.insert(cronLogs).values({
          runAt: runStartTime,
          sourceName: source.name,
          coursesAdded: result.added,
          coursesExpired: 0,
          errorMessage: result.errors.length > 0 ? result.errors.join("; ").slice(0, 4000) : null,
          status: result.errors.length > 0 && result.added === 0 ? "partial" : "success",
        })

        await logAuditEvent("update", "rss_sources", id, {
          manualFetch: true,
          name: source.name,
          coursesAdded: result.added,
          flagged: result.flagged,
          itemErrors: result.errors.length,
        })

        revalidatePath("/admin/sources")
        revalidatePath("/admin/courses")
        revalidatePath("/admin/flagged")
        revalidatePath("/admin/logs")
        revalidatePath("/")

        send({
          type: "done",
          added: result.added,
          flagged: result.flagged,
          skipped: result.skipped,
          errors: result.errors.length,
        })
      } catch (err) {
        try {
          await db.insert(cronLogs).values({
            runAt: runStartTime,
            sourceName: source.name,
            coursesAdded: 0,
            coursesExpired: 0,
            errorMessage: String(err).slice(0, 4000),
            status: "fail",
          })
        } catch (logErr) {
          console.error("[admin] Failed to write cron log for manual fetch:", logErr)
        }
        revalidatePath("/admin/sources")
        revalidatePath("/admin/logs")
        send({ type: "fatal", message: String(err).slice(0, 300) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}
