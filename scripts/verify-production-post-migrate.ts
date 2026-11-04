#!/usr/bin/env npx tsx
/** Verify StaffNotice.archivedAt exists on Production (read-only). */
import { readFileSync, existsSync } from "fs";

const path = process.env.JT_PROD_ENV_FILE?.trim();
if (!path || !existsSync(path)) throw new Error("JT_PROD_ENV_FILE required");

const env: Record<string, string> = {};
for (const line of readFileSync(path, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[m[1]] = v;
}

async function main() {
  const pg = await import("pg");
  const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const mig = await c.query<{ migration_name: string }>(
    `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name LIKE '%staff_notice%'`,
  );
  const col = await c.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='StaffNotice' AND column_name='archivedAt'`,
  );
  const counts = await c.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "HelpArticle" ha
        JOIN "HelpCategory" hc ON hc.id = ha."categoryId"
        WHERE hc.audience = 'ADMIN' AND ha.published = true) AS admin_articles,
      (SELECT COUNT(*)::int FROM "HelpArticle" ha
        JOIN "HelpCategory" hc ON hc.id = ha."categoryId"
        WHERE hc.audience = 'EMPLOYEE' AND ha.published = true) AS employee_articles,
      (SELECT COUNT(*)::int FROM "HelpFaq" WHERE published = true) AS faqs
  `);
  console.log(
    JSON.stringify(
      {
        staffNoticeMigrations: mig.rows.map((r) => r.migration_name),
        archivedAtColumn: col.rows.length > 0,
        helpCounts: counts.rows[0],
      },
      null,
      2,
    ),
  );
  await c.end();
}

main();
