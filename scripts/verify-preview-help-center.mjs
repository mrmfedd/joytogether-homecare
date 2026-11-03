#!/usr/bin/env node
/**
 * Verify Help Center seed counts and role visibility (Preview/local DB via DATABASE_URL).
 * Read-only except optional publish checks.
 */
import { config } from "dotenv";
import pg from "pg";

config();
config({ path: ".env.local", override: true });
config({ path: ".env.preview.local", override: true });

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.log(JSON.stringify({ ok: false, error: "DATABASE_URL required" }));
  process.exit(1);
}

const host = new URL(url).hostname;
const previewMarker = host.includes("ep-summer-band");

async function main() {
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const tables = await client.query(
    `SELECT to_regclass('"HelpArticle"') AS help_article, to_regclass('"HelpCategory"') AS help_category`,
  );
  if (!tables.rows[0]?.help_article) {
    await client.end();
    console.log(JSON.stringify({ ok: false, error: "Help Center tables missing — run migrate deploy" }));
    process.exit(1);
  }

  const counts = await client.query(`
    SELECT c.audience, COUNT(a.id)::int AS articles
    FROM "HelpCategory" c
    LEFT JOIN "HelpArticle" a ON a."categoryId" = c.id AND a.published = true
    GROUP BY c.audience
  `);
  const total = await client.query(
    `SELECT COUNT(*)::int AS n FROM "HelpArticle" WHERE published = true`,
  );
  const faqs = await client.query(
    `SELECT audience, COUNT(*)::int AS n FROM "HelpFaq" WHERE published = true GROUP BY audience`,
  );

  await client.end();

  const byAudience = Object.fromEntries(counts.rows.map((r) => [r.audience, r.articles]));
  const adminArticles = byAudience.ADMIN ?? 0;
  const employeeArticles = byAudience.EMPLOYEE ?? 0;

  console.log(
    JSON.stringify(
      {
        ok: true,
        dbHost: host,
        previewNeon: previewMarker,
        publishedArticlesTotal: total.rows[0]?.n ?? 0,
        adminPublishedArticles: adminArticles,
        employeePublishedArticles: employeeArticles,
        expectedAdmin: 25,
        expectedEmployee: 26,
        articlesReady: adminArticles >= 25 && employeeArticles >= 26,
        faqs: faqs.rows,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
  process.exit(1);
});
