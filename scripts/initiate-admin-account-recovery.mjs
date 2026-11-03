#!/usr/bin/env node
/**
 * Initiate secure administrator account recovery (single account, email verification via link).
 * Requires operator authorization via ADMIN_RECOVERY_SECRET in the target environment.
 *
 * Production example (after migration + env var set on Vercel):
 *   JT_USE_PRODUCTION_ENV=true \
 *   ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
 *   ADMIN_RECOVERY_SECRET=<matches Vercel Production> \
 *   node scripts/initiate-admin-account-recovery.mjs --confirm
 *
 * Never pass the secret on the command line in shared shells; export it in the session only.
 */
import { config } from "dotenv";
import pg from "pg";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";

config();
config({ path: ".env.local", override: true });
config({ path: ".env.preview.local", override: true });
if (process.env.JT_USE_PRODUCTION_ENV === "true") {
  config({ path: ".env.production.local", override: true });
}

const email = (process.env.ADMIN_INVITE_EMAIL || "").trim().toLowerCase();
const confirm = process.argv.includes("--confirm");
const operatorSecret = process.env.ADMIN_RECOVERY_SECRET?.trim() || "";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function assertSecret() {
  const expected = process.env.ADMIN_RECOVERY_SECRET?.trim();
  if (!expected || expected.length < 32) throw new Error("ADMIN_RECOVERY_SECRET missing or too short in environment.");
  if (!operatorSecret) throw new Error("Export ADMIN_RECOVERY_SECRET in your shell before running.");
  const a = createHash("sha256").update(operatorSecret).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) throw new Error("ADMIN_RECOVERY_SECRET mismatch.");
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");

async function main() {
  if (!email) throw new Error("Set ADMIN_INVITE_EMAIL");
  if (!confirm) {
    console.log(JSON.stringify({ ok: false, error: "Pass --confirm to send recovery email" }));
    process.exit(1);
  }
  assertSecret();

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const userRes = await client.query(
    `SELECT id, role, active FROM "User" WHERE email = $1`,
    [email],
  );
  const user = userRes.rows[0];
  if (!user) {
    const inv = await client.query(
      `SELECT COUNT(*)::int AS c FROM "AdminInvitation" WHERE email = $1 AND "acceptedAt" IS NULL AND "expiresAt" > NOW()`,
      [email],
    );
    await client.end();
    console.log(
      JSON.stringify({
        ok: false,
        error: "No user account. Use invitation flow instead.",
        pendingInvites: inv.rows[0]?.c ?? 0,
      }),
    );
    process.exit(1);
  }
  if (!user.active || user.role === "EMPLOYEE") {
    await client.end();
    throw new Error("Account not eligible for admin recovery.");
  }

  const allowedEmails = (process.env.ADMIN_RECOVERY_ALLOWED_EMAILS || "mrmfedd@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allowedEmails.includes(email)) {
    await client.end();
    throw new Error("Email not on ADMIN_RECOVERY_ALLOWED_EMAILS allowlist.");
  }
  if (user.role !== "SUPER_ADMIN") {
    await client.end();
    throw new Error("Account recovery is restricted to SUPER_ADMIN accounts.");
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const recoveryId = randomUUID();

  await client.query(
    `INSERT INTO "AdminAccountRecoveryToken" (id, "userId", "tokenHash", "expiresAt")
     VALUES ($1, $2, $3, $4)`,
    [recoveryId, user.id, tokenHash, expiresAt],
  );

  await client.query(
    `INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", meta, "createdAt")
     VALUES (gen_random_uuid()::text, $1, 'UPDATE', 'User', $1, $2::jsonb, NOW())`,
    [user.id, JSON.stringify({ event: "ADMIN_ACCOUNT_RECOVERY_INITIATED", email, role: user.role })],
  );

  await client.end();

  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.joytogetherhomecare.com").replace(/\/$/, "");
  const recoveryUrl = `${base}/admin/account-recovery?token=${token}`;

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendKey || !resendFrom) {
    console.log(JSON.stringify({ ok: false, error: "RESEND not configured in environment" }));
    process.exit(1);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: resendFrom,
      to: [email],
      subject: "JoyTogether Home Care — secure administrator account recovery",
      text: [
        "A secure account recovery was authorized for JoyTogether Admin access.",
        "",
        "Use this one-time link within 30 minutes to set a new password and reset MFA enrollment:",
        recoveryUrl,
        "",
        "After signing in, enroll a new authenticator on Account → Security.",
        "",
        "If you did not request this, contact JoyTogether leadership immediately.",
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    console.log(JSON.stringify({ ok: false, error: `Resend HTTP ${res.status}` }));
    process.exit(1);
  }

  console.log(
    JSON.stringify({
      ok: true,
      email,
      role: user.role,
      recoveryEmailSent: true,
      linkExpiresMinutes: 30,
      note: "Recovery link sent only to the account email; token not logged.",
    }),
  );
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
  process.exit(1);
});
