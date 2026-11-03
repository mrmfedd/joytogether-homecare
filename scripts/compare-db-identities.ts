#!/usr/bin/env npx tsx
/**
 * Compare Preview vs Production Neon identities from pulled Vercel env files.
 * Does not print connection strings or secrets.
 */
import { readFileSync, existsSync } from "fs";

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function hostOf(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    const ep = url.match(/ep-[a-z0-9-]+/i);
    return ep?.[0] ?? "(invalid-url)";
  }
}

function summarize(label: string, env: Record<string, string>) {
  const db =
    env.DATABASE_URL ||
    env.POSTGRES_URL ||
    env.POSTGRES_PRISMA_URL ||
    "";
  const direct =
    env.DIRECT_URL ||
    env.DATABASE_URL_UNPOOLED ||
    env.POSTGRES_URL_NON_POOLING ||
    "";
  return {
    label,
    neonProjectId: env.NEON_PROJECT_ID || "(unset)",
    databaseUrlHost: hostOf(db) || "(unset)",
    directUrlHost: hostOf(direct) || "(unset)",
    hasDatabaseUrl: Boolean(db),
    hasDirectUrl: Boolean(direct),
  };
}

const preview = summarize("preview", loadEnvFile(".env.preview.local"));
const production = summarize("production", loadEnvFile(".env.production.local"));

const hostsMatch =
  preview.databaseUrlHost !== "(unset)" &&
  production.databaseUrlHost !== "(unset)" &&
  preview.databaseUrlHost === production.databaseUrlHost;

const projectMatch =
  preview.neonProjectId !== "(unset)" &&
  production.neonProjectId !== "(unset)" &&
  preview.neonProjectId === production.neonProjectId;

console.log(
  JSON.stringify(
    {
      preview,
      production,
      isolated:
        !hostsMatch &&
        !projectMatch &&
        (production.databaseUrlHost === "(unset)" ||
          !preview.databaseUrlHost.includes(production.databaseUrlHost.split("-pooler")[0] ?? "")),
      warning: hostsMatch || projectMatch ? "Preview and Production share Neon identity" : undefined,
    },
    null,
    2,
  ),
);

if (hostsMatch || projectMatch) process.exit(1);
