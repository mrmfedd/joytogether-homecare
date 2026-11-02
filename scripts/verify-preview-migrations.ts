#!/usr/bin/env npx tsx
/**
 * Verifies Prisma migrations (including workforce) on the connected database.
 * Usage: npx tsx scripts/verify-preview-migrations.ts
 */
import "./load-local-env";
import pg from "pg";

const rawUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!rawUrl) throw new Error("DATABASE_URL or DIRECT_URL required");

const expectedMigrations = [
  "20260330120000_init",
  "20260330160000_security",
  "20261102190000_workforce",
];

const workforceTables = [
  "EmployeeInvitation",
  "EmployeeProfile",
  "Shift",
  "ShiftAssignment",
  "StaffNotice",
  "EmployeeTimeOffRequest",
];

async function main() {
  const host = new URL(rawUrl).hostname;
  const pool = new pg.Pool({
    connectionString: rawUrl,
    ssl: rawUrl.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  const applied = await pool.query<{ migration_name: string }>(
    `SELECT migration_name FROM "_prisma_migrations" WHERE rolled_back_at IS NULL ORDER BY finished_at`,
  );
  const appliedNames = applied.rows.map((r) => r.migration_name);
  const missing = expectedMigrations.filter((m) => !appliedNames.includes(m));

  const tableChecks: Record<string, boolean> = {};
  for (const table of workforceTables) {
    const res = await pool.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS ok`,
      [table],
    );
    tableChecks[table] = Boolean(res.rows[0]?.ok);
  }

  const employeeRole = await pool.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'UserRole' AND e.enumlabel = 'EMPLOYEE'
    ) AS ok`,
  );

  await pool.end();

  const ok =
    missing.length === 0 &&
    Object.values(tableChecks).every(Boolean) &&
    Boolean(employeeRole.rows[0]?.ok);

  console.log(
    JSON.stringify(
      {
        dbHost: host,
        expectedMigrations,
        appliedMigrations: appliedNames,
        missingMigrations: missing,
        workforceTables: tableChecks,
        userRoleEmployee: Boolean(employeeRole.rows[0]?.ok),
        ok,
      },
      null,
      2,
    ),
  );

  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
