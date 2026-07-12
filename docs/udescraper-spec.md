# Udecoupe Coupon Scraper — Technical Specification

**Project codename:** `udescraper`
**Version:** 1.1 (final)
**Purpose:** A standalone, private web application that scrapes fresh Udemy coupon courses from multiple public coupon websites, validates them against Udemy, and publishes a clean, structured, publicly accessible XML feed that the main Udecoupe application consumes as an RSS source.

---

## 1. Objectives

1. **Scrape** the latest free/discounted Udemy course coupons from multiple third-party coupon aggregator websites on a schedule.
2. **Discover** new coupon-provider websites automatically and queue them for admin approval.
3. **Resolve** every scraped item to its canonical Udemy course URL with the coupon code applied (`https://www.udemy.com/course/<slug>/?couponCode=XXXX`).
4. **Validate** coupons against Udemy itself — verify the course link is live and the coupon still makes the course free — with graceful degradation when Udemy serves bot-detection pages.
5. **Publish** a single, well-formed, publicly accessible XML feed (RSS 2.0 compatible) at a stable URL that Udecoupe can register as an RSS source and ingest with zero changes to its existing pipeline.
6. **Refresh** the XML on a schedule AND on demand via a manual "Refresh feed now" button, so expired/dead coupons disappear and new ones appear.
7. **Protect** the admin dashboard behind username + password authentication — only the XML endpoint is public.

---

## 2. System Context

```
[Coupon Websites] → [udescraper: scrapers + discovery + validator + DB] → [Public XML feed]
                                                                                ↓
                                                    [Udecoupe: existing RSS ingestion pipeline]
```

Udecoupe's ingest pipeline already: parses RSS 2.0, dedupes by feed item URL and resolved Udemy URL, extracts `couponCode` from direct Udemy links, extracts thumbnails from `media:content` / `media:thumbnail` or embedded `<img>`, and AI-enriches category/difficulty/description. The XML must therefore serve **direct Udemy URLs with coupon codes** so Udecoupe's resolver takes the fast path (no third-party page scraping needed on its side).

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | Same stack as Udecoupe; deploys to Vercel |
| Language | TypeScript | Type safety across scrapers and feed generation |
| Database | Neon Postgres + Drizzle ORM | Serverless-friendly; consistent with main app |
| Scraping | `fetch` + `cheerio` (HTML parsing) | Lightweight, serverless-compatible |
| Fallback scraping (JS-heavy sites) | Playwright via a queue-limited job (Phase 2) | Only if a target site cannot be scraped statically |
| Scheduling | Vercel Cron (daily on Hobby; every 4–6h on Pro) + manual triggers | Same pattern as Udecoupe |
| Auth (dashboard) | `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` (bcrypt) + `iron-session` cookie | Simple, no user table needed |
| XML generation | Server route handler generating RSS 2.0 with `media` namespace | Standards-compliant; cacheable |
| Rate limiting | Per-IP limiter on login route | Prevent brute force |
| Hosting | Vercel | Zero-ops, HTTPS included |

---

## 4. Data Sources

### 4.1 Seeded sources (initial targets)

| Source | Method | Notes |
|---|---|---|
| real.discount | Public JSON API (`/api-web/all-courses/?store=Udemy`) | Most reliable; structured data |
| discudemy.com | HTML scrape (cheerio) | Two-step: listing page → detail page → "Take Course" link |
| udemyfreebies.com | HTML scrape | Listing → outbound redirect link |
| coursevania.com | RSS feed + detail page scrape | Feed sometimes empty; scrape as fallback |
| freebiesglobal.com | HTML scrape | Aggregates multiple deal types; filter Udemy only |

Each source lives in a `sources` table: `id`, `name`, `type` (`api` | `html` | `rss`), `url`, `is_active`, `last_scraped_at`, `fail_count`, `config` (JSON selectors/settings). Sources auto-pause after 5 consecutive failures.

### 4.2 Source Discovery Mode

The bot actively hunts for new coupon-provider websites serving ready and updated coupons:

- A weekly **discovery job** queries search engines / known directories for patterns like "udemy coupon code today", "udemy 100% off coupon", "free udemy courses [current month/year]".
- Candidate domains are probed automatically: Does the site list Udemy course links with coupon codes? Does it have an RSS feed or a scrapable listing page? Has it been updated recently?
- Qualifying candidates land in a **"Discovered Sources" queue in the dashboard** with sample extracted items — the admin approves or rejects each one before it becomes an active source (auto-activating unknown scrapers against unknown HTML is too brittle/risky).
- Approved sources get a stored selector config; a generic extractor (link pattern `udemy.com/course/*?couponCode=*` + nearest heading/image) handles most sites without custom code.

---

## 5. Scraping Pipeline (per run)

1. **Fetch** each active source (timeout 20s, honest User-Agent, respect robots.txt, max 2 MB response).
2. **Extract** raw items: title, third-party or direct Udemy link, image, category hint, instructor hint, price info, source-stated expiry.
3. **Resolve** each item to canonical form: follow redirects / scrape detail page → `udemy.com/course/<slug>/?couponCode=CODE`. Strip all tracking params. Skip items with no coupon code and no free-price marker.
4. **Deduplicate** against DB by Udemy course slug + coupon code.
5. **Validate against Udemy** (see §6).
6. **Persist** to `coupons` table.
7. **Re-validate** existing live coupons on a rolling window (oldest first, max ~100/run to bound runtime). Dead/expired ones drop out of the XML.
8. **Log** the run to a `scrape_logs` table: source, items found, added, expired, errors, duration.

---

## 6. Udemy Validation (with graceful degradation)

The validator checks coupons directly against Udemy, and is engineered to survive bot detection rather than avoid it:

### 6.1 Validation checks

- `GET` the canonical Udemy URL → must return 200 (course exists, not unpublished).
- Parse the page's JSON-LD / meta / inline pricing data to confirm: coupon-applied price is `0` (or discounted), and no "coupon exhausted" / "expired" marker is present (Udemy caps most free coupons at ~1,000 redemptions).
- On success → `status = live`, `validated_at = now()`, `verification = verified`.

### 6.2 Fighting bot detection

- **Realistic request fingerprint:** rotate a small pool of current browser User-Agents; send `Accept-Language`, `Accept`, and `Referer` headers matching organic traffic.
- **Throttling:** strictly serialized Udemy requests with 3–6s randomized jitter between them; hard cap per run.
- **Detection awareness:** recognize challenge/CAPTCHA responses (403, 429, challenge-page HTML) and back off exponentially — pause Udemy validation for the rest of the run if 3 consecutive challenges occur.
- **Playwright fallback (Phase 2):** for a small priority subset (newest coupons), a headless browser with realistic fingerprint retries validation when static fetch is blocked.

### 6.3 Graceful degradation

Bot detection must NEVER empty the feed:

- If Udemy cannot be reached or serves a challenge, the coupon is kept and marked `verification = unverified` instead of being dropped.
- Unverified coupons still appear in the XML (flagged via `<udecoupe:verified>false</udecoupe:verified>`) and are re-attempted with priority on subsequent runs.
- Secondary freshness signals cover the gap while unverified:
  - **Cross-source corroboration** — the same course+coupon appearing on 2+ aggregator sites raises confidence.
  - **Source-stated expiry** — `expires_at` from aggregator pages is enforced regardless of verification state.
  - **Disappearance-based expiry** — a coupon that vanishes from all its originating sources for 2 consecutive runs is expired.
  - **Detail-page recheck** — if the third-party detail page now says "expired" or 404s, the coupon is expired.

---

## 7. Database Schema

```
coupons
  id              serial PK
  udemy_slug      text NOT NULL
  coupon_code     text NOT NULL
  udemy_url       text NOT NULL            -- canonical URL with couponCode applied
  title           text NOT NULL
  description     text                     -- plain text, cleaned
  instructor      text
  category        text
  language        text
  rating          numeric(3,2)             -- from Udemy page when verified
  students        integer
  original_price  text                     -- e.g. "$84.99"
  sale_price      text DEFAULT 'Free'
  thumbnail_url   text                     -- Udemy CDN image
  expires_at      timestamptz              -- coupon expiry if stated by source
  status          text NOT NULL            -- live | expired | dead
  verification    text NOT NULL            -- verified | unverified
  confidence      integer DEFAULT 1        -- number of corroborating sources
  source_id       int FK → sources
  source_item_url text                     -- original third-party page (dedupe/debug)
  first_seen_at   timestamptz DEFAULT now()
  validated_at    timestamptz
  last_seen_at    timestamptz              -- last time any source listed it
  UNIQUE (udemy_slug, coupon_code)

sources            (as described in §4.1)
discovered_sources (domain, sample_items JSON, probe_result, status: pending|approved|rejected, found_at)
scrape_logs        (run_at, source_name, found, added, expired, dead, errors, duration_ms, status)
```

---

## 8. Public XML Feed

**Endpoint:** `GET /feed.xml` — public, no auth, `Cache-Control: public, max-age=900`, regenerated from DB (ISR-cached), cache busted after every manual or scheduled run.

**Format:** RSS 2.0 with `media` and custom `udecoupe` namespaces. Only `status = live` coupons, newest first, capped at 100 items.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:udecoupe="https://udecoupe.com/ns/1.0">
  <channel>
    <title>Udescraper — Live Udemy Coupons</title>
    <link>https://udescraper.example.com</link>
    <description>Validated free Udemy course coupons</description>
    <lastBuildDate>Mon, 13 Jul 2026 06:00:00 GMT</lastBuildDate>
    <ttl>360</ttl>
    <item>
      <title>Complete Python Bootcamp 2026</title>
      <link>https://www.udemy.com/course/python-bootcamp/?couponCode=JULYFREE</link>
      <guid isPermaLink="false">python-bootcamp:JULYFREE</guid>
      <pubDate>Mon, 13 Jul 2026 05:30:00 GMT</pubDate>
      <description><![CDATA[Cleaned plain-text course description...]]></description>
      <dc:creator>Jane Instructor</dc:creator>
      <category>Development</category>
      <media:thumbnail url="https://img-c.udemycdn.com/course/480x270/xxx.jpg"/>
      <udecoupe:couponCode>JULYFREE</udecoupe:couponCode>
      <udecoupe:originalPrice>$84.99</udecoupe:originalPrice>
      <udecoupe:salePrice>Free</udecoupe:salePrice>
      <udecoupe:rating>4.6</udecoupe:rating>
      <udecoupe:students>120543</udecoupe:students>
      <udecoupe:language>English</udecoupe:language>
      <udecoupe:expiresAt>2026-07-15T23:59:59Z</udecoupe:expiresAt>
      <udecoupe:validatedAt>2026-07-13T05:30:00Z</udecoupe:validatedAt>
      <udecoupe:verified>true</udecoupe:verified>
      <udecoupe:confidence>3</udecoupe:confidence>
    </item>
  </channel>
</rss>
```

**Compatibility guarantee:** `<link>` is always the direct Udemy URL with `couponCode` — Udecoupe's existing parser and resolver consume this as-is. The `udecoupe:*` extension fields are additive; Udecoupe can optionally read them later (rating, price, students, verified) to skip AI-guessing that data. All text is XML-escaped; descriptions are CDATA-wrapped.

---

## 9. Private Admin Dashboard

Auth: username + password (env: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`), iron-session cookie (7-day TTL), rate-limited login (5 attempts / 15 min per IP), all routes except `/login` and `/feed.xml` protected by middleware.

Pages:

- **Dashboard** — live coupon count, verified vs unverified split, per-source health, last run summary, next scheduled run, and a prominent **"Refresh feed now"** button that runs the full pipeline on demand (scrape all active sources, apply expiries, rebuild XML, bust the feed cache) with a live streaming progress log.
- **Coupons** — table with status/verification filters, search, manual expire/delete, re-validate button per row.
- **Sources** — add/pause/delete sources, per-source **"Scrape now"** with live streaming progress log (same UX pattern as Udecoupe's fetch log).
- **Discovered Sources** — approval queue from the discovery job: domain, probe results, sample extracted items, approve/reject actions.
- **Logs** — scrape run history with errors.

---

## 10. Scheduling & Lifecycle

| Job | Schedule (Hobby) | Action |
|---|---|---|
| `scrape` | daily 05:00 UTC | Full pipeline (§5) for all active sources |
| `revalidate` | same run, phase 2 | Re-check oldest live + all unverified coupons; expire dead ones |
| `discover` | weekly | Source discovery (§4.2), queue candidates |

- Cron routes protected by `CRON_SECRET` bearer token (timing-safe compare).
- **Manual "Refresh feed now"** (full pipeline) and per-source **"Scrape now"** available from the dashboard at any time — no waiting for cron.
- `/feed.xml` cache is invalidated immediately after any manual run, so Udecoupe sees fresh data on its next poll without waiting for the cache TTL.
- Coupons with `expires_at < now()` are auto-expired without needing a validation request.
- Coupons not re-validated in 72h are treated as stale and re-checked with priority.

---

## 11. Non-Functional Requirements

- **Politeness:** ≥ 2s delay between requests to the same aggregator host (3–6s randomized for Udemy); honest User-Agent; obey robots.txt; hard cap of items per source per run (e.g. 50).
- **Security:** SSRF guards on all outbound fetches (block private IP ranges), input validation with Zod, no secrets in client code, parameterized queries via Drizzle.
- **Resilience:** per-source failure isolation (one broken site never kills the run), auto-pause failing sources, Udemy bot-detection backoff (§6.2), graceful degradation (§6.3), all errors logged and visible in the dashboard.
- **Performance:** XML served from cache (≤ 15 min stale, busted on manual refresh); feed generation query indexed on `(status, first_seen_at)`.
- **Observability:** every run logged; dashboard shows last-run status per source and verification health.

---

## 12. Environment Variables

```
DATABASE_URL             # Neon Postgres
ADMIN_USERNAME           # dashboard login
ADMIN_PASSWORD_HASH      # bcrypt hash
IRON_SESSION_SECRET      # 32+ chars
CRON_SECRET              # protects cron routes
NEXT_PUBLIC_BASE_URL     # e.g. https://udescraper.vercel.app
```

---

## 13. Milestones

1. **M1 — Foundation:** Next.js app, DB schema, auth, middleware, empty dashboard.
2. **M2 — First scraper + feed:** real.discount (API source), Udemy validator with graceful degradation, `/feed.xml` output, register feed in Udecoupe and confirm end-to-end ingestion.
3. **M3 — More scrapers:** discudemy, udemyfreebies, coursevania, freebiesglobal.
4. **M4 — Lifecycle:** re-validation, expiry, cron schedules, source auto-pause, manual "Refresh feed now".
5. **M5 — Discovery:** weekly discovery job, Discovered Sources approval queue, generic extractor.
6. **M6 — Dashboard polish:** streaming scrape logs, coupon management, source health, verification metrics.
