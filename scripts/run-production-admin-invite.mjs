#!/usr/bin/env node
/**
 * Create and email initial Production SUPER_ADMIN invitation (matches create-admin-invite.ts).
 * Uses Production Neon schema as deployed on main (no feature-branch-only columns).
 *
 * Local DB file + optional Resend in file:
 *   JT_PROD_ENV_FILE=$HOME/.config/joytogether/production-neon.env \
 *   ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
 *   node scripts/run-production-admin-invite.mjs --confirm
 *
 * Vercel Production secrets (no local RESEND copy):
 *   npx vercel env run -e production -- \
 *     node scripts/run-production-admin-invite.mjs --confirm --vercel-production
 *
 * Requires ADMIN_BOOTSTRAP_SECRET or AUTH_SECRET (32+ chars) on Vercel Production.
 */
import { createHash, randomBytes, randomUUID } from "crypto";
import { existsSync, readFileSync } from "fs";
import pg from "pg";

const PRODUCTION_NEON_PROJECT = "weathered-term-63569834";
const PRODUCTION_HOST_MARKER = "ep-nameless-hall";
const PREVIEW_HOST_MARKER = "ep-summer-band";
const ALLOWED_EMAILS = (process.env.ADMIN_BOOTSTRAP_ALLOWED_EMAILS || "mrmfedd@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const vercelProduction = process.argv.includes("--vercel-production");
const prodEnvFile = process.env.JT_PROD_ENV_FILE?.trim();

function loadEnvFile(path) {
  if (!existsSync(path)) throw new Error(`JT_PROD_ENV_FILE not found: ${path}`);
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === "[SENSITIVE]" || !val) continue;
    process.env[m[1]] = val;
  }
}

if (vercelProduction) {
  assertBootstrapSecretPresent();
} else if (prodEnvFile) {
  loadEnvFile(prodEnvFile);
} else {
  console.log(
    JSON.stringify({
      ok: false,
      error:
        "Set JT_PROD_ENV_FILE or pass --vercel-production with `npx vercel env run -e production --`.",
    }),
  );
  process.exit(1);
}

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

const email = (process.env.ADMIN_INVITE_EMAIL || "mrmfedd@gmail.com").trim().toLowerCase();
const role = (process.env.ADMIN_INVITE_ROLE || "SUPER_ADMIN").trim();
const confirm = process.argv.includes("--confirm");
const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.joytogetherhomecare.com").replace(/\/$/, "");

function assertBootstrapSecretPresent() {
  const secret =
    process.env.ADMIN_BOOTSTRAP_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "Vercel Production must include AUTH_SECRET or ADMIN_BOOTSTRAP_SECRET (32+ chars) for bootstrap authorization.",
    );
  }
}

function hashInviteToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function verifyProductionUrl() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url || url === "[SENSITIVE]") {
    throw new Error("Production DATABASE_URL missing from Vercel env or JT_PROD_ENV_FILE.");
  }
  const host = new URL(url).hostname;
  if (host.includes(PREVIEW_HOST_MARKER)) {
    throw new Error("Refusing: connection targets Preview Neon.");
  }
  const ok =
    host.includes(PRODUCTION_HOST_MARKER) ||
    process.env.NEON_PROJECT_ID === PRODUCTION_NEON_PROJECT;
  if (!ok) {
    throw new Error("Production identity not verified (expected ep-nameless-hall).");
  }
  return { url, host };
}

async function main() {
  if (!email.includes("@")) throw new Error("Invalid ADMIN_INVITE_EMAIL");
  if (!ALLOWED_EMAILS.includes(email)) {
    throw new Error("Email not on ADMIN_BOOTSTRAP_ALLOWED_EMAILS allowlist.");
  }
  if (role !== "SUPER_ADMIN") {
    throw new Error("Bootstrap invitations are restricted to SUPER_ADMIN.");
  }
  if (!confirm) {
    console.log(
      JSON.stringify({
        ok: false,
        error: "Pass --confirm to create invitation and send email.",
        vercelProduction,
      }),
    );
    process.exit(1);
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim();
  if (!resendKey || !resendFrom) {
    throw new Error("RESEND_API_KEY and RESEND_FROM must be available (Vercel Production env).");
  }
  if (!/joytogetherhomecare\.com/i.test(resendFrom)) {
    throw new Error("RESEND_FROM must use the verified joytogetherhomecare.com domain.");
  }
  const fromUsesNotifications = /notifications@joytogetherhomecare\.com/i.test(resendFrom);

  const { url, host } = verifyProductionUrl();
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const userRes = await client.query(`SELECT id FROM "User" WHERE email = $1`, [email]);
  if (userRes.rows[0]) {
    await client.end();
    throw new Error("An account already exists for this email on Production.");
  }

  const pending = await client.query(
    `SELECT id FROM "AdminInvitation" WHERE email = $1 AND "acceptedAt" IS NULL AND "expiresAt" > NOW()`,
    [email],
  );
  if (pending.rows.length) {
    await client.end();
    throw new Error("A pending invitation already exists for this email.");
  }

  const burnedRows = await client.query(
    `SELECT id FROM "AdminInvitation" WHERE email = $1 AND "acceptedAt" IS NULL`,
    [email],
  );
  for (const row of burnedRows.rows) {
    const burned = createHash("sha256")
      .update(`burned-${row.id}-${randomBytes(16).toString("hex")}`)
      .digest("hex");
    await client.query(
      `UPDATE "AdminInvitation" SET "expiresAt" = $1, "tokenHash" = $2 WHERE id = $3`,
      [new Date(Date.now() - 60_000), burned, row.id],
    );
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);
  const invitationId = randomUUID();

  await client.query(
    `INSERT INTO "AdminInvitation" (id, email, role, "tokenHash", "expiresAt", "createdAt")
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [invitationId, email, role, tokenHash, expiresAt],
  );

  await client.end();

  const acceptUrl = `${base}/admin/accept-invite?token=${token}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: resendFrom,
      to: [email],
      subject: "JoyTogether Home Care Admin invitation",
      text: [
        "You have been invited to JoyTogether Home Care Admin.",
        "",
        "Open this one-time link within 48 hours to set your password:",
        acceptUrl,
        "",
        "If you did not expect this email, ignore it.",
      ].join("\n"),
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log(
      JSON.stringify({
        ok: false,
        error: json.message || `Resend HTTP ${res.status}`,
        invitationCreated: true,
        invitationIdPrefix: invitationId.slice(0, 8),
        expiresAt: expiresAt.toISOString(),
        note: "Invitation row exists; email not sent. Resolve Resend and burn/retry manually.",
      }),
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: vercelProduction ? "vercel-env-run" : "local-env-file",
        productionIdentityVerified: true,
        dbHost: host,
        neonProjectId: process.env.NEON_PROJECT_ID || PRODUCTION_NEON_PROJECT,
        email,
        role,
        invitationIdPrefix: invitationId.slice(0, 8),
        invitationExpiresAt: expiresAt.toISOString(),
        priorInvitesBurned: burnedRows.rows.length,
        resendAccepted: true,
        resendMessageId: json.id ?? null,
        resendFromUsesJoyTogetherDomain: true,
        resendFromUsesNotificationsAddress: fromUsesNotifications,
        acceptInviteBaseUrl: `${base}/admin/accept-invite`,
        adminLoginUrl: `${base}/admin/login`,
        repeatBootstrapBlocked: "Pending invitation or existing user prevents duplicate runs.",
        note: "Resend accepted the send request; delivery to inbox is not guaranteed. Token not logged.",
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
