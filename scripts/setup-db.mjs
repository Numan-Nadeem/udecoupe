import pg from "pg"

const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL })

const statements = [
  `CREATE TABLE IF NOT EXISTS courses (
    id serial PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    description_enriched text,
    instructor text,
    category text,
    difficulty text,
    thumbnail_url text,
    rating numeric(2,1),
    total_students integer,
    coupon_code text,
    coupon_url text NOT NULL UNIQUE,
    affiliate_url text,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    is_flagged boolean DEFAULT false,
    expired_reports integer DEFAULT 0,
    source text,
    rss_source_name text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id serial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    is_verified boolean DEFAULT false,
    token text,
    token_expires_at timestamptz,
    unsubscribe_token text NOT NULL UNIQUE,
    subscribed_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS coupon_clicks (
    id serial PRIMARY KEY,
    course_id integer REFERENCES courses(id) ON DELETE CASCADE,
    clicked_at timestamptz DEFAULT now(),
    ip_hash text,
    user_agent text,
    category text
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key text PRIMARY KEY,
    value text
  )`,
  `CREATE INDEX IF NOT EXISTS courses_is_active_idx ON courses (is_active)`,
  `CREATE INDEX IF NOT EXISTS courses_category_idx ON courses (category)`,
  `CREATE INDEX IF NOT EXISTS courses_difficulty_idx ON courses (difficulty)`,
  `CREATE INDEX IF NOT EXISTS courses_created_at_idx ON courses (created_at)`,
  `CREATE INDEX IF NOT EXISTS courses_expires_at_idx ON courses (expires_at)`,
  `CREATE INDEX IF NOT EXISTS coupon_clicks_course_id_idx ON coupon_clicks (course_id)`,
]

async function main() {
  console.log("[setup-db] Connecting to database...")
  for (const sql of statements) {
    const label = sql.split("\n")[0].trim()
    await pool.query(sql)
    console.log(`[setup-db] OK: ${label}`)
  }
  console.log("[setup-db] Done.")
  await pool.end()
}

main().catch((err) => {
  console.error("[setup-db] Error:", err)
  process.exit(1)
})
