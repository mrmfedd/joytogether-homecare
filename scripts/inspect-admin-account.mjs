#!/usr/bin/env node
/**
 * Inspect administrator account state (no secrets, no tokens).
 *
 * Preview (default env):
 *   ADMIN_INVITE_EMAIL=mrmfedd@gmail.com node scripts/inspect-admin-account.mjs
 *
 * Production (requires populated .env.production.local from `vercel env pull`):
 *   JT_USE_PRODUCTION_ENV=true ADMIN_INVITE_EMAIL=mrmfedd@gmail.com node scripts/inspect-admin-account.mjs
 */
import { config } from "dotenv";
import { existsSync, readFileSync } from "fs";
import pg from "pg";
import { createHash } from "crypto";

config();
config({ path: ".env.local", override: true });
config({ path: ".env.preview.local", override: true });
if (process.env.JT_USE_PRODUCTION_ENV === "true") {
  config({ path: ".env.production.local", override: true });
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === "[SENSITIVE]") continue;
    process.env[m[1]] = val;
  }
}

const prodEnvFile = process.env.JT_PROD_ENV_FILE?.trim();
if (prodEnvFile) loadEnvFile(prodEnvFile);

const email = (process.env.ADMIN_INVITE_EMAIL || "").trim().toLowerCase();
if (!email) {
  console.log(JSON.stringify({ ok: false, error: "Set ADMIN_INVITE_EMAIL" }));
  process.exit(1);
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
if (!url || url === "[SENSITIVE]") {
  console.log(
    JSON.stringify({
      ok: false,
      error:
        "No usable database URL. Use JT_PROD_ENV_FILE with Neon unpooled URL from Vercel/Neon console, or replace [SENSITIVE] placeholders after `vercel env pull`.",
    }),
  );
  process.exit(1);
}

const host = new URL(url).hostname;
const previewMarker = host.includes("ep-summer-band") || process.env.NEON_PROJECT_ID === "lucky-fire-28361357";

async function main() {
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const now = new Date();

  const userRes = await client.query(
    `SELECT id, role, active, "mfaEnabled", ("passwordHash" IS NOT NULL) AS has_password,
            ("mfaSecret" IS NOT NULL) AS has_mfa_secret, "lastLoginAt", "createdAt"
     FROM "User" WHERE email = $1`,
    [email],
  );
  const user = userRes.rows[0];
  let activeSessions = 0;
  if (user) {
    const s = await client.query(`SELECT COUNT(*)::int AS c FROM "Session" WHERE "userId" = $1`, [user.id]);
    activeSessions = s.rows[0]?.c ?? 0;
  }

  const invites = await client.query(
    `SELECT role, "acceptedAt", "expiresAt", "createdAt" FROM "AdminInvitation" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 5`,
    [email],
  );

  await client.end();

  const inviteRows = invites.rows.map((i) => ({
    role: i.role,
    accepted: Boolean(i.acceptedAt),
    currentlyValid: !i.acceptedAt && new Date(i.expiresAt) > now,
    expiresAt: new Date(i.expiresAt).toISOString(),
  }));

  let recommendedRecovery = "unknown";
  if (!user && inviteRows.some((i) => i.currentlyValid)) {
    recommendedRecovery = "ACCEPT_PENDING_INVITE";
  } else if (!user) {
    recommendedRecovery = "SEND_NEW_SUPER_ADMIN_INVITE";
  } else if (user.active && user.has_password && user.has_mfa_secret) {
    recommendedRecovery = "FORGOT_PASSWORD_INSUFFICIENT_IF_MFA_LOST_USE_ACCOUNT_RECOVERY";
  } else if (user.active && user.has_password && !user.has_mfa_secret) {
    recommendedRecovery = "FORGOT_PASSWORD_THEN_ENROLL_MFA";
  } else if (user.active && !user.has_password) {
    recommendedRecovery = "RESEND_INVITE_OR_ACCOUNT_RECOVERY";
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dbHost: host,
        environmentHint: previewMarker ? "preview-neon" : "non-preview-host",
        email,
        user: user
          ? {
              role: user.role,
              active: user.active,
              mfaEnabled: user.mfaEnabled,
              hasPassword: user.has_password,
              hasMfaSecret: user.has_mfa_secret,
              lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
              createdAt: new Date(user.createdAt).toISOString(),
            }
          : null,
        activeSessions,
        invites: inviteRows,
        recommendedRecovery,
        ordinaryForgotPasswordClearsMfa: false,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
  process.exit(1);
});
