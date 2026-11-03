#!/usr/bin/env node
/**
 * Production read-only admin inspect wrapper.
 * Requires JT_PROD_ENV_FILE pointing at gitignored env with unpooled Production Neon URL.
 *
 * Usage:
 *   JT_PROD_ENV_FILE=$HOME/.config/joytogether/production-neon.env \
 *   ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
 *   node scripts/run-production-admin-inspect.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const envFile = process.env.JT_PROD_ENV_FILE?.trim();
if (!envFile || !existsSync(envFile)) {
  console.log(
    JSON.stringify({
      ok: false,
      error:
        "Set JT_PROD_ENV_FILE to a gitignored file containing Production DATABASE_URL_UNPOOLED (Neon joytogether-production / ep-nameless-hall…). Never commit this file.",
      expectedNeonProject: "weathered-term-63569834",
      expectedHostMarker: "ep-nameless-hall",
    }),
  );
  process.exit(1);
}

process.env.JT_USE_PRODUCTION_ENV = "true";
const result = spawnSync(
  process.execPath,
  ["scripts/inspect-admin-account.mjs"],
  {
    env: { ...process.env, ADMIN_INVITE_EMAIL: process.env.ADMIN_INVITE_EMAIL || "mrmfedd@gmail.com" },
    stdio: "inherit",
  },
);
process.exit(result.status ?? 1);
