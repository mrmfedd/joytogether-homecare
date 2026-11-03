import { execSync } from "node:child_process";
import {
  describeMigrationDatabaseUrl,
  selectMigrationDatabaseUrl,
  shouldRunMigrateDuringBuild,
} from "./migration-database-url.mjs";

execSync("npx prisma generate", { stdio: "inherit" });

const vercelEnv = process.env.VERCEL_ENV?.trim() ?? "";
const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
const migrationMeta = describeMigrationDatabaseUrl(process.env);

const shouldMigrate = shouldRunMigrateDuringBuild(process.env);

if (shouldMigrate) {
  console.log(
    `Applying Prisma migrations (env source: ${migrationMeta.source}, unpooled: ${migrationMeta.unpooled})…`,
  );
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const runSeed =
    vercelEnv === "preview" &&
    process.env.RUN_SEED_ON_PREVIEW !== "false" &&
    process.env.SKIP_SEED !== "true";

  if (runSeed) {
    console.log("Running Prisma seed on preview deploy (idempotent upserts)…");
    execSync("npx prisma db seed", { stdio: "inherit" });
  }
} else {
  const productionMigrateAllowed = process.env.RUN_PRODUCTION_MIGRATIONS === "true";
  if (vercelEnv === "production" && dbUrl.length > 0 && !productionMigrateAllowed) {
    console.warn(
      "Skipping prisma migrate deploy on Production build (set RUN_PRODUCTION_MIGRATIONS=true only during an approved migrate window).",
    );
  } else if (!migrationMeta.hasConfiguredUrl) {
    console.warn("Skipping prisma migrate deploy (no DATABASE_URL / unpooled equivalents).");
  } else if (process.env.SKIP_MIGRATIONS === "true") {
    console.warn("Skipping prisma migrate deploy (SKIP_MIGRATIONS=true).");
  }
}

execSync("npx next build", { stdio: "inherit", env: process.env });
