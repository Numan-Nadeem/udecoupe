import { db } from "./db"
import { settings } from "./schema"
import { eq } from "drizzle-orm"

export function buildAffiliateUrl(couponUrl: string, affiliateId: string | null): string {
  if (!affiliateId) return couponUrl
  try {
    const url = new URL(couponUrl)
    url.searchParams.set("referralCode", affiliateId)
    return url.toString()
  } catch {
    return couponUrl
  }
}

export async function getAffiliateId(): Promise<string> {
  try {
    const setting = await db.query.settings.findFirst({
      where: eq(settings.key, "affiliate_id"),
    })
    if (setting?.value) return setting.value
  } catch (err) {
    console.error("[v0] getAffiliateId settings lookup failed:", err)
  }
  return process.env.UDEMY_AFFILIATE_ID || ""
}
