/**
 * Creates the admin CMS tables: admin_audit_logs, rss_sources, cron_logs.
 * Run: node --env-file-if-exists=.env.development.local scripts/setup-admin-db.mjs
 */
import pg from "pg"

const { Client } = pg

const statements = [
  `CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id serial PRIMARY KEY,
    action text,
    entity text,
    entity_id integer,
    changed_fields jsonb,
    performed_at timestamptz DEFAULT now(),
    ip_hash text
  )`,
  `CREATE TABLE IF NOT EXISTS rss_sources (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    url text NOT NULL UNIQUE,
    is_active boolean DEFAULT true,
    last_fetched_at timestamptz,
    fail_count integer DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS cron_logs (
    id serial PRIMARY KEY,
    run_at timestamptz,
    source_name text,
    courses_added integer,
    courses_expired integer,
    error_message text,
    status text
  )`,
  `CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON admin_audit_logs (performed_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_audit_logs (entity)`,
  `CREATE INDEX IF NOT EXISTS idx_cron_logs_run_at ON cron_logs (run_at DESC)`,
]

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
  }
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    for (const sql of statements) {
      await client.query(sql)
      console.log("OK:", sql.split("\n")[0].slice(0, 70))
    }
    console.log("Admin tables ready.")
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("Setup failed:", err.message)
  process.exit(1)
})
