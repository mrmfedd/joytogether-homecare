#!/usr/bin/env npx tsx
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { execSync } from "child_process";

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
  const host = new URL(process.env.DATABASE_URL!).hostname;
  if (host.includes("ep-summer-band")) throw new Error("Refusing Preview database.");
  if (!host.includes("ep-nameless-hall")) throw new Error("Production host marker not found.");
}

loadProdEnvFile();
console.log("Applying Prisma migrations to Production (unpooled URL)…");
execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
console.log("migrate deploy finished.");
