#!/usr/bin/env npx tsx
import { readFileSync, existsSync } from "fs";
import pg from "pg";

const path = process.env.JT_PROD_ENV_FILE?.trim();
if (!path || !existsSync(path)) throw new Error("JT_PROD_ENV_FILE required");

const env: Record<string, string> = {};
for (const line of readFileSync(path, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[m[1]] = v;
}

async function main() {
  const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query<{ migration_name: string }>(
    `SELECT migration_name FROM "_prisma_migrations" ORDER BY finished_at`,
  );
  console.log(JSON.stringify(r.rows.map((x) => x.migration_name), null, 2));
  await c.end();
}

main();
