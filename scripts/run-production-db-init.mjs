#!/usr/bin/env node
/**
 * One-shot production DB init (migrate + seed). Reads URLs from env file path in JT_PROD_ENV_FILE.
 * Does not print connection strings.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { describeMigrationDatabaseUrl } from "./migration-database-url.mjs";

const PREVIEW_MARKER = "ep-summer-band-bc49hrns";
const PREVIEW_PROJECT = "lucky-fire-28361357";

const envFile = process.env.JT_PROD_ENV_FILE?.trim();
if (!envFile || !existsSync(envFile)) {
  console.error("JT_PROD_ENV_FILE must point to a readable env file.");
  process.exit(1);
}

const env = {};
for (const line of readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  env[m[1]] = m[2];
}

const meta = describeMigrationDatabaseUrl(env);
if (!meta.hasConfiguredUrl || !meta.unpooled) {
  console.error("Migration URL must be unpooled (DATABASE_URL_UNPOOLED or equivalent).");
  process.exit(1);
}

const hosts = [env.DATABASE_URL, env.DATABASE_URL_UNPOOLED, env.NEON_PROJECT_ID]
  .filter(Boolean)
  .join(" ");
if (hosts.includes(PREVIEW_MARKER) || env.NEON_PROJECT_ID === PREVIEW_PROJECT) {
  console.error("Refusing: env targets Preview Neon markers.");
  process.exit(1);
}

console.log(
  JSON.stringify({
    phase: "migrate",
    migrationSource: meta.source,
    unpooled: meta.unpooled,
    neonProjectId: env.NEON_PROJECT_ID || "(unset)",
  }),
);

const runEnv = { ...process.env, ...env, VERCEL_ENV: "production" };

try {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: runEnv,
    cwd: process.cwd(),
  });
} catch (e) {
  console.error("migrate deploy failed");
  process.exit(1);
}

console.log(JSON.stringify({ phase: "seed", note: "idempotent production seed" }));
execSync("npx prisma db seed", { stdio: "inherit", env: runEnv });

if (process.env.JT_PROD_ENV_FILE_DELETE === "true") {
  unlinkSync(envFile);
}
