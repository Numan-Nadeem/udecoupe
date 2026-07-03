export type ResolvedCoupon = {
  /** Final Udemy course URL with couponCode applied */
  udemyUrl: string
  /** The coupon code itself (e.g. "FREEDEC2026") */
  couponCode: string | null
  /** How the link was resolved */
  via: "direct" | "scraped" | "redirect"
}

const RESOLVE_TIMEOUT_MS = 15_000
const MAX_HTML_BYTES = 2 * 1024 * 1024 // 2 MB page cap

/** SSRF guard: block localhost, private ranges, and link-local hosts. */
function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return true
  }
  // IPv4 private/loopback/link-local ranges
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true
  // IPv6 loopback / unique-local / link-local
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return true
  return false
}

/** Matches udemy.com course URLs inside HTML/text, with or without couponCode. */
const UDEMY_LINK_RE =
  /https?:\/\/(?:www\.)?udemy\.com\/course\/[a-zA-Z0-9\-_%/]+(?:\?[^"'\s<>\\)]*)?/g

function isUdemyUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === "udemy.com" || host.endsWith(".udemy.com")
  } catch {
    return false
  }
}

function extractCouponCodeFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const code = u.searchParams.get("couponCode") || u.searchParams.get("couponcode")
    return code && /^[A-Za-z0-9._-]{2,64}$/.test(code) ? code : null
  } catch {
    return null
  }
}

/** Normalize a Udemy URL: strip trackers, keep only couponCode param. */
function normalizeUdemyUrl(url: string): string {
  try {
    const u = new URL(url)
    const code = u.searchParams.get("couponCode") || u.searchParams.get("couponcode")
    const clean = new URL(`https://www.udemy.com${u.pathname}`)
    if (code) clean.searchParams.set("couponCode", code)
    return clean.toString()
  } catch {
    return url
  }
}

/** Decode HTML entities that commonly appear inside href attributes. */
function decodeEntities(html: string): string {
  return html.replace(/&amp;/g, "&").replace(/&#38;/g, "&").replace(/&#x26;/gi, "&")
}

/**
 * Resolve an RSS item link to the actual Udemy course URL with coupon code.
 *
 * - If the link is already a udemy.com URL, it is normalized and returned.
 * - Otherwise the third-party page is fetched (with SSRF guards, timeout and
 *   size caps) and scanned for udemy.com/course links. Links containing a
 *   couponCode are preferred.
 * - Returns null when no Udemy link can be found.
 */
export async function resolveCouponLink(rawUrl: string): Promise<ResolvedCoupon | null> {
  // Case 1: already a direct Udemy link
  if (isUdemyUrl(rawUrl)) {
    const normalized = normalizeUdemyUrl(rawUrl)
    return {
      udemyUrl: normalized,
      couponCode: extractCouponCodeFromUrl(normalized),
      via: "direct",
    }
  }

  // SSRF guard: never fetch private/internal hosts
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return null
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return null
  if (isPrivateHost(parsed.hostname)) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UdecoupeBot/1.0; +https://udecoupe.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    })
  } catch {
    clearTimeout(timer)
    return null
  } finally {
    clearTimeout(timer)
  }

  // Case 2: the page redirected straight to Udemy
  if (isUdemyUrl(response.url)) {
    const normalized = normalizeUdemyUrl(response.url)
    return {
      udemyUrl: normalized,
      couponCode: extractCouponCodeFromUrl(normalized),
      via: "redirect",
    }
  }

  if (!response.ok || !response.body) return null

  // Read page HTML with a hard size cap
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > MAX_HTML_BYTES) {
        await reader.cancel()
        break
      }
      chunks.push(value)
    }
  } catch {
    // Partial reads are fine — scan whatever we received
  }

  const html = decodeEntities(new TextDecoder("utf-8", { fatal: false }).decode(concatChunks(chunks, received)))

  // Case 3: scrape udemy links out of the page
  const matches = html.match(UDEMY_LINK_RE)
  if (!matches || matches.length === 0) return null

  // Prefer links that carry a couponCode
  const withCoupon = matches.find((m) => extractCouponCodeFromUrl(m) !== null)
  const best = withCoupon || matches[0]
  const normalized = normalizeUdemyUrl(best)

  return {
    udemyUrl: normalized,
    couponCode: extractCouponCodeFromUrl(normalized),
    via: "scraped",
  }
}

function concatChunks(chunks: Uint8Array[], totalLength: number): Uint8Array {
  const merged = new Uint8Array(Math.min(totalLength, MAX_HTML_BYTES))
  let offset = 0
  for (const chunk of chunks) {
    if (offset + chunk.byteLength > merged.byteLength) {
      merged.set(chunk.subarray(0, merged.byteLength - offset), offset)
      break
    }
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return merged
}
