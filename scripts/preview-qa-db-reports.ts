#!/usr/bin/env npx tsx
/** Preview DB read-only QA: report metrics vs DB counts, help article keywords. */
import "./load-local-env";
import pg from "pg";
import { parseReportDateRange } from "../src/lib/admin/reporting/date-range";
import { buildReportExportPayload, REPORT_CATEGORIES } from "../src/lib/admin/reporting/build-export-payload";
import { renderReportPdf } from "../src/lib/admin/reporting/render-pdf";
import { renderReportXlsx } from "../src/lib/admin/reporting/render-xlsx";

const PREVIEW_MARKER = "ep-summer-band";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL required");
  const host = new URL(url).hostname;
  if (!host.includes(PREVIEW_MARKER)) throw new Error(`Refusing non-preview: ${host}`);

  const range = parseReportDateRange({ from: "2020-01-01", to: "2030-12-31" });
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

  const dbCounts = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "Lead") AS leads,
      (SELECT COUNT(*)::int FROM "Consultation") AS consultations,
      (SELECT COUNT(*)::int FROM "EmployeeProfile") AS profiles,
      (SELECT COUNT(*)::int FROM "StaffNotice" WHERE "archivedAt" IS NULL) AS notices
  `);

  const helpCheck = await pool.query(`
    SELECT a.slug, a.title, c.audience
    FROM "HelpArticle" a
    JOIN "HelpCategory" c ON c.id = a."categoryId"
    WHERE a.published = true AND c.audience = 'ADMIN'
    AND a.slug IN ('reports-and-analytics', 'customer-leads', 'staff-notices-and-communications', 'consultations')
  `);

  const contentCheck = await pool.query(`
    SELECT a.slug,
           (a.content ILIKE '%Download Excel%') AS has_excel,
           (a.content ILIKE '%Calendar view%') AS has_calendar
    FROM "HelpArticle" a
    WHERE a.slug IN ('reports-and-analytics', 'consultations')
  `);

  await pool.end();

  const exportChecks: Record<string, { rows: number; pdf: number; xlsx: number }> = {};
  for (const cat of REPORT_CATEGORIES) {
    const payload = await buildReportExportPayload(cat, range);
    const pdf = await renderReportPdf(payload);
    const xlsx = await renderReportXlsx(payload);
    exportChecks[cat] = {
      rows: payload.rows.length,
      pdf: pdf.length,
      xlsx: xlsx.length,
    };
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dbHost: host,
        neonProjectId: process.env.NEON_PROJECT_ID,
        dbCounts: dbCounts.rows[0],
        helpArticles: helpCheck.rows,
        helpContentFlags: contentCheck.rows,
        exportChecks,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
