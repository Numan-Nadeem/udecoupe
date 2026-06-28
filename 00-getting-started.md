# Getting Started — Udecoupe

## Overview

Udecoupe is a monorepo Next.js 14 application for discovering and sharing free Udemy courses with active coupons. It consists of three main components: a public-facing listing site, an admin CMS, and automated background jobs.

All code lives in a single repository deployed to Vercel.

---

## Architecture

### Route Groups

The app uses Next.js route groups to organize public and admin sections:

```
app/
  /(public)              # Public-facing pages
    /page.tsx            # Listing
    /courses/[slug]/page.tsx
    /go/[slug]/route.ts  # Affiliate redirect
    /subscribe/route.ts
    /verify/route.ts
    /unsubscribe/route.ts

  /(admin)               # Protected admin pages
    /admin/login/page.tsx
    /admin/dashboard/page.tsx
    /admin/courses/...
    /admin/subscribers/...
    /admin/sources/...
    /admin/logs/page.tsx
    /admin/audit/page.tsx
    /admin/settings/page.tsx

  /api
    /admin/login/route.ts
    /cron/fetch-coupons/route.ts
    /cron/expire-courses/route.ts
```

### Database

Single Neon PostgreSQL database with 7 tables:

- `courses` — Course listings (title, coupon, affiliate link, expiry, flags, etc.)
- `subscribers` — Email subscribers (verified, tokens, unsubscribe)
- `coupon_clicks` — Click logs for affiliate tracking (IP hash, user agent)
- `rss_sources` — RSS feed sources (name, URL, fail count, last fetch)
- `cron_logs` — Background job execution history (status, errors, counts)
- `admin_audit_logs` — Admin action audit trail (who, what, when, fields changed)
- `settings` — Key-value configuration (affiliate ID, coupon TTL, etc.)

### Authentication

- **Public**: No auth required
- **Admin**: Single password via iron-session with httpOnly cookies
- **Cron**: Bearer token header (`CRON_SECRET`)

### Key Libraries

**All installed with `@latest` tag for latest versions and features. Consult official docs for API details.**

| Purpose | Library |
|---|---|
| ORM | drizzle-orm |
| Session | iron-session |
| Rate Limiting | @upstash/ratelimit |
| Email | resend |
| RSS Parsing | fast-xml-parser |
| AI Enrichment | OpenRouter API |
| Validation | zod |
| Password Hashing | bcrypt |
| Build Tool | drizzle-kit |

---

## Setup Plan

### Phase 0: Boilerplate

Initialize Next.js 14 project, install **latest versions** of all dependencies, set up environment variables, create folder structure.

**All dependencies installed with `@latest` tag for cutting-edge features and security patches.**

**Important:** AI agent should consult the **latest official documentation** for each library, especially:
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Zod Validation](https://zod.dev)
- [TypeScript](https://www.typescriptlang.org/docs)

Ensure all code follows the latest best practices and API conventions. Do not rely on outdated patterns.

### Phase 1: Database & Core Libraries

Create Drizzle schema, run migrations, set up DB client, write utility libraries for auth, IP hashing, rate limiting, bot detection.

### Phase 2: Admin Authentication

Implement login page, password verification, iron-session, middleware to protect `/admin/*` routes.

### Phase 3: Public Listing & Redirect

Build home page with course listing, course detail page, affiliate redirect route (`/go/[slug]`), click logging.

### Phase 4: Admin CRUD

Implement courses list/create/edit/delete, subscribers management, RSS sources management, settings page, audit logging.

### Phase 5: Email & Subscribe

Build subscribe form, double opt-in flow, email verification, unsubscribe, digest email triggering.

### Phase 6: Background Jobs (Cron)

Implement RSS polling, AI enrichment via OpenRouter, course expiry job, email notifications.

### Phase 7: Polish & Deploy

Add sitemap, SEO (OG tags, schema.org), security headers, rate limiting, deploy to Vercel with env vars.

---

## How to Use This Guide

You will receive **three detailed specification documents**:

1. **01-public-app-spec.md** — Complete spec for public listing, detail pages, subscribe flow, redirect route
2. **02-admin-cms-spec.md** — Complete spec for admin routes, CRUD operations, audit logging, settings
3. **03-cron-agent-spec.md** — Complete spec for RSS polling, AI enrichment, expiry cron, email digests

### Workflow

1. **Read this document** (architecture overview)
2. **I will provide detailed setup instructions** with step-by-step scaffolding (env vars, DB migrations, dependencies)
3. **Run setup** to bootstrap the project locally
4. **I will provide 01-public-app-spec.md** — Feed to Claude Code/Cursor to build public app
5. **I will provide 02-admin-cms-spec.md** — Feed to Claude Code/Cursor to build admin CMS
6. **I will provide 03-cron-agent-spec.md** — Feed to Claude Code/Cursor to build background jobs
7. **Test locally**, then deploy to Vercel

Each spec is self-contained and includes:
- Detailed route descriptions with logic flows
- Full code examples (models, handlers, queries)
- Database operations and schemas
- Security requirements
- Error handling patterns
- Build checklist

**Do not try to build everything at once. Follow the phases sequentially.**

---

## Key Constraints

1. **Single admin password** — No user management. One password hash in env var.
2. **Monorepo only** — Public, admin, and cron all in same Next.js app for simplicity.
3. **Vercel cron only** — No external job scheduler. `/api/cron/*` routes triggered by Vercel.
4. **No IP storage** — IPs hashed before DB write. Daily salt rotation.
5. **Affiliate URLs computed once** — Stored at course insert time, never re-computed.
6. **Enrichment non-blocking** — If AI call fails, course still inserts but flagged.
7. **Rate limited public routes** — Subscribe, verify, redirect, unsubscribe all rate limited via Upstash.

---

## Environment Variables Summary

```
DATABASE_URL                    # Neon pooling URL
DATABASE_URL_UNPOOLED          # Neon direct URL (migrations only)
IRON_SESSION_SECRET            # 32+ char random string
ADMIN_PASSWORD_HASH            # bcrypt hash of your password
CRON_SECRET                    # Random bearer token for cron routes
RESEND_API_KEY                 # Email service
RESEND_FROM_EMAIL              # Sending address
UPSTASH_REDIS_REST_URL         # Rate limiting
UPSTASH_REDIS_REST_TOKEN       # Rate limiting
OPENROUTER_API_KEY             # AI enrichment
OPENROUTER_MODEL               # e.g. openai/gpt-4o-mini (optional)
NEXT_PUBLIC_BASE_URL           # http://localhost:3000 (or production URL)
UDEMY_AFFILIATE_ID             # Your affiliate ID
DAILY_SALT                     # IP hashing salt (rotate daily)
AUDIT_SALT                     # Audit log hashing salt
```

---

## Tech Stack Summary

**All packages installed with `@latest` tag. Consult official documentation for latest API patterns and best practices.**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL (latest pooling)
- **ORM**: Drizzle
- **Auth**: iron-session
- **API**: OpenRouter (latest models available)
- **Email**: Resend
- **Cache/Rate Limit**: Upstash Redis
- **Hosting**: Vercel (latest deployment)
- **Styling**: Tailwind CSS (optional, use inline for simplicity)

**Key Documentation Links:**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zod Docs](https://zod.dev)
- [iron-session](https://github.com/vvo/iron-session)
- [Resend Email](https://resend.com/docs)

---

## Testing Strategy

1. **Local**: `npm run dev` on http://localhost:3000
2. **Admin login**: http://localhost:3000/admin/login (use your password)
3. **Public listing**: http://localhost:3000 (empty until cron runs or manual adds)
4. **Cron trigger**: Manually call `/api/cron/fetch-coupons` with `Authorization: Bearer ${CRON_SECRET}` header
5. **Production**: Deploy to Vercel, Vercel cron will auto-trigger every 6 hours

---

## Next Steps

Once you understand this architecture:

1. Wait for **detailed setup instructions** (scaffolding, dependencies, env vars, DB migrations)
2. Run setup locally to get the boilerplate working
3. I'll provide specs 1-3 **one at a time** (don't request all three at once)
4. Feed each spec to Claude Code and follow the build checklist
5. Test each phase before moving to the next
6. Deploy to Vercel when complete

Ready to start?
