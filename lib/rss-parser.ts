import { XMLParser } from "fast-xml-parser"

export interface RssItem {
  title: string
  description: string
  couponUrl: string
  thumbnail?: string
  instructor?: string
  category?: string
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep values as strings; we sanitize/coerce manually
  parseTagValue: false,
  trimValues: true,
})

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (typeof obj["#text"] === "string") return obj["#text"]
    if (typeof obj["#text"] === "number") return String(obj["#text"])
  }
  return ""
}

/** Strip HTML tags and collapse whitespace for plain-text descriptions. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Clean a feed description into meaningful plain text.
 * Many coupon feeds ship only an <img> tag or bare URLs as the description —
 * after stripping HTML and URLs, those become empty strings instead of
 * garbage like "https://img-c.udemycdn.com/...".
 */
function cleanDescription(rawHtml: string): string {
  return stripHtml(rawHtml)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\[html\]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Extract the first <img src="..."> URL from raw HTML, if any. */
function extractImageUrl(rawHtml: string): string {
  const match = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1]?.startsWith("http") ? match[1] : ""
}

const FETCH_TIMEOUT_MS = 20_000
const MAX_XML_BYTES = 5 * 1024 * 1024 // 5MB cap

export async function fetchRssFeed(url: string): Promise<{ items: RssItem[] }> {
  // SSRF guard: only allow http(s) URLs
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error("Invalid RSS URL")
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("RSS URL must be http(s)")
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "UdecoupeBot/1.0 (+https://udecoupe.vercel.app)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      cache: "no-store",
    })
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`)
  }

  const xml = await response.text()
  if (xml.length > MAX_XML_BYTES) {
    throw new Error("RSS feed too large")
  }

  let parsed: Record<string, any>
  try {
    parsed = parser.parse(xml)
  } catch (err) {
    throw new Error(`Failed to parse RSS XML: ${String(err)}`)
  }

  const items: RssItem[] = []

  if (parsed.feed?.entry) {
    // Atom format
    for (const entry of asArray<Record<string, any>>(parsed.feed.entry)) {
      const links = asArray<Record<string, any>>(entry.link)
      const href =
        links.find((l) => l["@_rel"] === "alternate")?.["@_href"] ||
        links[0]?.["@_href"] ||
        ""
      const rawSummary = textOf(entry.summary) || textOf(entry.content)
      items.push({
        title: stripHtml(textOf(entry.title)),
        description: cleanDescription(rawSummary),
        couponUrl: typeof href === "string" ? href.trim() : "",
        thumbnail: entry["media:thumbnail"]?.["@_url"] || extractImageUrl(rawSummary) || "",
        instructor: textOf(entry.author?.name) || "",
        category: asArray<Record<string, any>>(entry.category)[0]?.["@_term"] || "",
      })
    }
  } else if (parsed.rss?.channel?.item) {
    // RSS 2.0 format
    for (const item of asArray<Record<string, any>>(parsed.rss.channel.item)) {
      const rawDescription = textOf(item.description)
      items.push({
        title: stripHtml(textOf(item.title)),
        description: cleanDescription(rawDescription),
        couponUrl: textOf(item.link).trim(),
        thumbnail:
          item["media:content"]?.["@_url"] ||
          item["media:thumbnail"]?.["@_url"] ||
          textOf(item.image?.url) ||
          extractImageUrl(rawDescription) ||
          "",
        instructor: stripHtml(textOf(item["dc:creator"]) || textOf(item.author)),
        category: stripHtml(textOf(asArray(item.category)[0])),
      })
    }
  }

  // Drop items without the minimum required fields
  const valid = items.filter((i) => i.title.length > 0 && i.couponUrl.startsWith("http"))
  return { items: valid }
}
