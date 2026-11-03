#!/usr/bin/env npx tsx
/**
 * Idempotent Help Center seed only (no site settings / services reseed).
 * Production: JT_PROD_ENV_FILE=$HOME/.config/joytogether/production-neon.env npx tsx scripts/seed-production-help-center.ts
 */
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedHelpCenter } from "../prisma/seed-help";

const PRODUCTION_HOST_MARKER = "ep-nameless-hall";
const PREVIEW_HOST_MARKER = "ep-summer-band";

function loadProdEnvFile() {
  const path = process.env.JT_PROD_ENV_FILE?.trim() || join(homedir(), ".config/joytogether/production-neon.env");
  if (!existsSync(path)) throw new Error(`Production env file not found: ${path}`);
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (val === "[SENSITIVE]" || !val) continue;
    process.env[m[1]] = val;
  }
  if (process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

async function main() {
  loadProdEnvFile();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required");
  const host = new URL(url).hostname;
  if (host.includes(PREVIEW_HOST_MARKER)) throw new Error("Refusing Preview database.");
  if (!host.includes(PRODUCTION_HOST_MARKER)) throw new Error("Production host marker not found.");

  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    await seedHelpCenter(prisma);
    console.log(JSON.stringify({ ok: true, message: "Help Center seed complete (upsert only)." }));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
  process.exit(1);
});
