#!/usr/bin/env npx tsx
/**
 * Read-only production DB connectivity + empty-state check.
 * Loads .env.production.local only (not .env.local / preview).
 */
import { config } from "dotenv";
import pg from "pg";

const NEON_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
  "NEON_PROJECT_ID",
  "VERCEL_ENV",
] as const;

for (const k of NEON_KEYS) {
  delete process.env[k];
}

config({ path: ".env.production.local", override: true });

const PREVIEW_MARKER = "ep-summer-band-bc49hrns";
const PREVIEW_PROJECT = "lucky-fire-28361357";

function hostOf(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

const dbUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  "";
const directUrl =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL_UNPOOLED?.trim() ||
  process.env.POSTGRES_URL_NON_POOLING?.trim() ||
  dbUrl;

const summary = {
  vercelEnv: process.env.VERCEL_ENV || "(unset)",
  dbHost: hostOf(dbUrl) || "(unset)",
  directHost: hostOf(directUrl) || "(unset)",
  neonProjectId: process.env.NEON_PROJECT_ID?.trim() || "(unset)",
  connected: false,
  latencyMs: 0 as number | undefined,
  publicTables: [] as string[],
  prismaMigrations: 0,
  totalPublicTables: 0,
  error: undefined as string | undefined,
};

async function main() {
  if (!dbUrl) {
    summary.error =
      "No DATABASE_URL in environment — Vercel integration secrets are not included in `vercel env pull`; use Neon Browse data or export URLs for local TCP check";
    console.log(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  if (summary.dbHost.includes(PREVIEW_MARKER) || summary.neonProjectId === PREVIEW_PROJECT) {
    summary.error = "Production env points at Preview Neon markers";
    console.log(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: directUrl || dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const start = Date.now();
  try {
    await client.connect();
    summary.connected = true;
    summary.latencyMs = Date.now() - start;

    const tables = await client.query<{ tablename: string }>(
      `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    );
    summary.publicTables = tables.rows.map((r) => r.tablename);
    summary.totalPublicTables = summary.publicTables.length;

    if (summary.publicTables.includes("_prisma_migrations")) {
      const mig = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "_prisma_migrations"`,
      );
      summary.prismaMigrations = Number(mig.rows[0]?.count ?? 0);
    }
  } catch (e) {
    summary.error = e instanceof Error ? e.message : String(e);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }

  console.log(JSON.stringify(summary, null, 2));
  if (summary.error) process.exit(1);
}

main();
