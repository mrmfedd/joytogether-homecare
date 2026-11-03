#!/usr/bin/env npx tsx
/** Preview-only: verify DB identity, apply migrations, seed Help Center (upsert). */
import "./load-local-env";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedHelpCenter } from "../prisma/seed-help";
import { execSync } from "child_process";

const PREVIEW_MARKER = "ep-summer-band";
const PRODUCTION_MARKER = "ep-nameless-hall";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL required (.env.preview.local)");
  const host = new URL(url).hostname;
  if (host.includes(PRODUCTION_MARKER)) throw new Error(`Refusing Production host: ${host}`);
  if (!host.includes(PREVIEW_MARKER)) throw new Error(`Not a recognized Preview host: ${host}`);

  console.log(JSON.stringify({ step: "identity", dbHost: host, neonProjectId: process.env.NEON_PROJECT_ID ?? null }));

  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });

  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const applied = await pool.query<{ migration_name: string }>(
    `SELECT migration_name FROM "_prisma_migrations" WHERE rolled_back_at IS NULL ORDER BY finished_at`,
  );
  const hasArchive = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='StaffNotice' AND column_name='archivedAt'`,
  );

  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  await seedHelpCenter(prisma);
  await prisma.$disconnect();

  const counts = await pool.query(`
    SELECT c.audience, COUNT(a.id)::int AS articles
    FROM "HelpCategory" c
    LEFT JOIN "HelpArticle" a ON a."categoryId" = c.id AND a.published = true
    GROUP BY c.audience
  `);
  await pool.end();

  const byAudience = Object.fromEntries(counts.rows.map((r) => [r.audience, r.articles]));
  console.log(
    JSON.stringify(
      {
        ok: true,
        appliedMigrations: applied.rows.map((r) => r.migration_name),
        staffNoticeArchivedAt: hasArchive.rows.length > 0,
        helpArticles: byAudience,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
