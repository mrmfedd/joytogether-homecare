#!/usr/bin/env npx tsx
/**
 * Read-only production DB verification (counts only, no secrets).
 * Requires JT_PROD_ENV_FILE pointing at production Neon URLs (gitignored).
 */
import { readFileSync, existsSync } from "fs";
import pg from "pg";
import { describeMigrationDatabaseUrl } from "./migration-database-url.mjs";

const PREVIEW_MARKER = "ep-summer-band-bc49hrns";
const PREVIEW_PROJECT = "lucky-fire-28361357";

function loadEnv(path: string) {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[m[1]] = val;
  }
  return env;
}

const envFile = process.env.JT_PROD_ENV_FILE?.trim();
if (!envFile || !existsSync(envFile)) {
  console.log(
    JSON.stringify({
      ok: false,
      error: "JT_PROD_ENV_FILE unset — use Vercel/Neon integration env file (not committed)",
    }),
  );
  process.exit(1);
}

const env = loadEnv(envFile);
const meta = describeMigrationDatabaseUrl(env);
const host = (() => {
  try {
    return new URL(env.DATABASE_URL_UNPOOLED || env.DATABASE_URL || "").hostname;
  } catch {
    return "";
  }
})();

if (host.includes(PREVIEW_MARKER) || env.NEON_PROJECT_ID === PREVIEW_PROJECT) {
  console.log(JSON.stringify({ ok: false, error: "Refusing Preview markers" }));
  process.exit(1);
}

async function main() {
  const connectUrl =
    env.DATABASE_URL_UNPOOLED?.trim() ||
    env.POSTGRES_URL_NON_POOLING?.trim() ||
    env.DIRECT_URL?.trim() ||
    env.DATABASE_URL?.trim();
  if (!connectUrl) throw new Error("No database URL in env file");

  const client = new pg.Client({
    connectionString: connectUrl,
    ssl: { rejectUnauthorized: false },
  });

  const out: Record<string, unknown> = {
    ok: true,
    neonProjectId: env.NEON_PROJECT_ID || "(unset)",
    migrationUrlSource: meta.source,
    unpooled: meta.unpooled,
    dbHost: host || "(unset)",
  };

  await client.connect();
  const mig = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM "_prisma_migrations"`,
  );
  const tables = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM pg_catalog.pg_tables WHERE schemaname = 'public'`,
  );
  const settings = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "SiteSetting"`);
  const services = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "Service"`);
  const areas = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "ServiceArea"`);
  const faqs = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "FAQ"`);
  const leads = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "Lead"`);
  const employees = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM "EmployeeProfile"`,
  );
  const users = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "User"`);

  out.prismaMigrationRows = Number(mig.rows[0]?.count ?? 0);
  out.publicTableCount = Number(tables.rows[0]?.count ?? 0);
  out.siteSettingCount = Number(settings.rows[0]?.count ?? 0);
  out.serviceCount = Number(services.rows[0]?.count ?? 0);
  out.serviceAreaCount = Number(areas.rows[0]?.count ?? 0);
  out.faqCount = Number(faqs.rows[0]?.count ?? 0);
  out.leadCount = Number(leads.rows[0]?.count ?? 0);
  out.employeeProfileCount = Number(employees.rows[0]?.count ?? 0);
  out.userCount = Number(users.rows[0]?.count ?? 0);

  await client.end();
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
  process.exit(1);
});
