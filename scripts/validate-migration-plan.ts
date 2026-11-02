#!/usr/bin/env npx tsx
/**
 * Validates the committed Prisma migration plan without applying to any database.
 * Safe to run anytime before owner approves production migrate deploy.
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "node:child_process";

const migrationsDir = join(process.cwd(), "prisma/migrations");
const expectedOrder = [
  "20260330120000_init",
  "20260330160000_security",
  "20261102190000_workforce",
];

function main() {
  execSync("npx prisma validate", { stdio: "inherit" });
  execSync("npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > /dev/null", {
    stdio: "pipe",
  });

  const folders = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const missing = expectedOrder.filter((m) => !folders.includes(m));
  const extra = folders.filter((m) => !expectedOrder.includes(m));
  const sqlChecks: Record<string, boolean> = {};

  for (const name of expectedOrder) {
    const sqlPath = join(migrationsDir, name, "migration.sql");
    sqlChecks[name] = existsSync(sqlPath) && readFileSync(sqlPath, "utf8").trim().length > 0;
  }

  const ok = missing.length === 0 && extra.length === 0 && Object.values(sqlChecks).every(Boolean);

  console.log(
    JSON.stringify(
      {
        expectedOrder,
        foundMigrations: folders,
        missingMigrations: missing,
        unexpectedMigrations: extra,
        migrationSqlPresent: sqlChecks,
        productionApplyCommand: "npx prisma migrate deploy",
        productionSeedCommand: "npm run db:seed",
        approvalRequired: true,
        note: "Do not run migrate deploy on production until owner approves docs/PRODUCTION-MIGRATION-PLAN.md",
        ok,
      },
      null,
      2,
    ),
  );

  if (!ok) process.exit(1);
}

main();
