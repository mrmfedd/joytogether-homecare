#!/usr/bin/env npx tsx
/**
 * Preview QA: authenticated export smoke + DB metric sanity (read-only counts).
 * Requires admin session cookie in JT_PREVIEW_ADMIN_COOKIE or run login manually and paste.
 * Usage:
 *   PREVIEW_URL=https://... npx tsx scripts/preview-qa-exports.mjs
 * Optional: JT_PREVIEW_ADMIN_COOKIE="next-auth.session-token=..."
 */
import "./load-local-env";
import pg from "pg";

const PREVIEW_MARKER = "ep-summer-band";
const categories = ["leads", "consultations", "private-duty", "employees", "shifts", "time-off", "timesheets"];

async function dbSnapshot() {
  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!url || !new URL(url).hostname.includes(PREVIEW_MARKER)) return null;
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const [leads, consultations, notices] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS n FROM "Lead"`),
    pool.query(`SELECT COUNT(*)::int AS n FROM "Consultation" WHERE "scheduledAt" IS NOT NULL`),
    pool.query(`SELECT COUNT(*)::int AS n FROM "StaffNotice" WHERE "archivedAt" IS NULL`),
  ]);
  await pool.end();
  return {
    leadCount: leads.rows[0]?.n,
    scheduledConsultations: consultations.rows[0]?.n,
    activeNotices: notices.rows[0]?.n,
  };
}

async function fetchExport(base: string, cookie: string, category: string, format: string) {
  const q = new URLSearchParams({ category, format, from: "2020-01-01", to: "2030-12-31" });
  const res = await fetch(`${base}/api/admin/reports/export?${q}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: "manual",
  });
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, length: buf.length, magic: buf.subarray(0, 4).toString("utf8"), contentType: res.headers.get("content-type") };
}

async function main() {
  const base = process.env.PREVIEW_URL?.replace(/\/$/, "");
  const cookie = process.env.JT_PREVIEW_ADMIN_COOKIE?.trim() || "";
  const snapshot = await dbSnapshot();
  console.log(JSON.stringify({ dbSnapshot: snapshot }, null, 2));

  if (!base) {
    console.log(JSON.stringify({ ok: false, error: "PREVIEW_URL required for HTTP export tests" }));
    process.exit(0);
  }

  const publicSmoke = await fetch(`${base}/api/health/db`).then((r) => r.json()).catch(() => ({}));
  console.log(JSON.stringify({ previewHealth: publicSmoke }, null, 2));

  if (!cookie) {
    console.log(
      JSON.stringify({
        ok: false,
        exportTests: "SKIPPED",
        reason: "Set JT_PREVIEW_ADMIN_COOKIE for authenticated export verification",
      }),
    );
    process.exit(0);
  }

  const results: Record<string, unknown> = {};
  for (const cat of categories) {
    for (const format of ["csv", "xlsx", "pdf"]) {
      const key = `${cat}:${format}`;
      results[key] = await fetchExport(base, cookie, cat, format);
    }
  }
  const allOk = Object.values(results).every((r: { status?: number; length?: number }) => r.status === 200 && (r.length ?? 0) > 100);
  console.log(JSON.stringify({ exportResults: results, allOk }, null, 2));
  process.exit(allOk ? 0 : 1);
}

main();
