#!/usr/bin/env npx tsx
/**
 * Reset a single Production SUPER_ADMIN: revoke password/MFA/sessions/tokens, send reprovision invite.
 *
 * Prerequisites:
 * - JT_PROD_ENV_FILE with unpooled Production Neon URL (+ RESEND_* + ADMIN_RECOVERY_SECRET from Production)
 * - Migrations applied including admin_reprovision_invite
 * - Fresh Neon manual snapshot (Free tier) before --confirm
 *
 * Inspect only:
 *   JT_PROD_ENV_FILE=~/.config/joytogether/production-neon.env \
 *   ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
 *   npx tsx scripts/reset-production-super-admin.ts
 *
 * Execute (after snapshot):
 *   NEON_BACKUP_ACK=1 ADMIN_RECOVERY_SECRET=… \
 *   JT_PROD_ENV_FILE=… ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
 *   npx tsx scripts/reset-production-super-admin.ts --confirm
 */
import { existsSync, readFileSync } from "fs";
import pg from "pg";
import { config } from "dotenv";
import { UserRole } from "../src/generated/prisma";
import { createAndEmailAdminReprovisionInvitation } from "../src/lib/admin/invitations";
import { assertRecoveryOperatorSecret } from "../src/lib/admin/account-recovery";
import { prisma } from "../src/lib/prisma";

const PRODUCTION_NEON_PROJECT = "weathered-term-63569834";
const PRODUCTION_HOST_MARKER = "ep-nameless-hall";

config();
config({ path: ".env.local", override: true });

const prodEnvPath = process.env.JT_PROD_ENV_FILE?.trim();
if (!prodEnvPath) {
  console.log(
    JSON.stringify({
      ok: false,
      error:
        "Set JT_PROD_ENV_FILE to a gitignored Production env file (unpooled Neon URL + Resend + ADMIN_RECOVERY_SECRET for --confirm).",
      expectedNeonProject: PRODUCTION_NEON_PROJECT,
      expectedHostMarker: PRODUCTION_HOST_MARKER,
    }),
  );
  process.exit(1);
}

if (!existsSync(prodEnvPath)) throw new Error(`JT_PROD_ENV_FILE not found: ${prodEnvPath}`);
for (const line of readFileSync(prodEnvPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === "[SENSITIVE]") continue;
    process.env[m[1]] = val;
  }

const email = (process.env.ADMIN_INVITE_EMAIL || "mrmfedd@gmail.com").trim().toLowerCase();
const confirm = process.argv.includes("--confirm");
const operatorSecret = process.env.ADMIN_RECOVERY_SECRET?.trim() || "";

function verifyProductionUrl() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url || url === "[SENSITIVE]") {
    throw new Error("Set DATABASE_URL_UNPOOLED in JT_PROD_ENV_FILE.");
  }
  const host = new URL(url).hostname;
  if (host.includes("ep-summer-band")) {
    throw new Error("Refusing: connection targets Preview Neon, not Production.");
  }
  const productionIdentityOk =
    host.includes(PRODUCTION_HOST_MARKER) || process.env.NEON_PROJECT_ID === PRODUCTION_NEON_PROJECT;
  if (!productionIdentityOk) {
    throw new Error(
      `Production identity not verified (host ${host}). Expected ${PRODUCTION_HOST_MARKER} or NEON_PROJECT_ID=${PRODUCTION_NEON_PROJECT}.`,
    );
  }
  return { url, host };
}

async function productionCensus(pgUrl: string) {
  const client = new pg.Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const adminUsers = await client.query(
    `SELECT email, role, active FROM "User" WHERE role IN ('SUPER_ADMIN','ADMIN') ORDER BY email`,
  );
  const employees = await client.query(`SELECT COUNT(*)::int AS c FROM "User" WHERE role = 'EMPLOYEE'`);
  const leads = await client.query(`SELECT COUNT(*)::int AS c FROM "Lead"`);
  const consultations = await client.query(`SELECT COUNT(*)::int AS c FROM "Consultation"`);
  const hasReprovisionCol = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = 'AdminInvitation' AND column_name = 'reprovisionUserId' LIMIT 1`,
  );
  await client.end();
  return {
    adminAccounts: adminUsers.rows.map((r) => ({ email: r.email, role: r.role, active: r.active })),
    employeeCount: employees.rows[0]?.c ?? 0,
    leadCount: leads.rows[0]?.c ?? 0,
    consultationCount: consultations.rows[0]?.c ?? 0,
    reprovisionMigrationApplied: hasReprovisionCol.rowCount === 1,
  };
}

async function revokeAndAudit(userId: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: null,
        mfaEnabled: false,
        mfaSecret: null,
        active: true,
        role: UserRole.SUPER_ADMIN,
        sessionVersion: { increment: 1 },
      },
    }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.adminAccountRecoveryToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      userId,
      action: "UPDATE",
      entity: "User",
      entityId: userId,
      meta: {
        event: "ADMIN_SUPER_ADMIN_RESET_INITIATED",
        email,
        sessionsRevoked: true,
        mfaEnrollmentRevoked: true,
        passwordRevoked: true,
        recoveryTokensInvalidated: true,
      },
    },
  });
}

async function main() {
  const { url, host } = verifyProductionUrl();
  const census = await productionCensus(url);

  const user = await prisma.user.findUnique({ where: { email } });
  const preview = {
    ok: true,
    mode: confirm ? "execute" : "inspect",
    dbHost: host,
    productionIdentityVerified: true,
    neonProjectId: process.env.NEON_PROJECT_ID || PRODUCTION_NEON_PROJECT,
    email,
    census,
    targetUser: user
      ? {
          idPrefix: user.id.slice(0, 8),
          role: user.role,
          active: user.active,
          mfaEnabled: user.mfaEnabled,
          hasPassword: Boolean(user.passwordHash),
          sessionVersion: user.sessionVersion,
        }
      : null,
    reprovisionMigrationApplied: census.reprovisionMigrationApplied,
    adminLoginUrl: "https://www.joytogetherhomecare.com/admin/login",
    nextStep: confirm ? null : "Create Neon snapshot, set NEON_BACKUP_ACK=1, export ADMIN_RECOVERY_SECRET, re-run with --confirm",
  };

  if (!confirm) {
    console.log(JSON.stringify(preview, null, 2));
    return;
  }

  if (!census.reprovisionMigrationApplied) {
    throw new Error("Migration 20261103140000_admin_reprovision_invite not applied on Production.");
  }
  if (!user || user.role !== UserRole.SUPER_ADMIN || !user.active) {
    throw new Error("Target must be an active SUPER_ADMIN user.");
  }
  const allowed = (process.env.ADMIN_RECOVERY_ALLOWED_EMAILS || "mrmfedd@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes(email)) {
    throw new Error("Email not on ADMIN_RECOVERY_ALLOWED_EMAILS allowlist.");
  }
  if (process.env.NEON_BACKUP_ACK !== "1") {
    throw new Error("Create a Neon manual snapshot first, then set NEON_BACKUP_ACK=1.");
  }
  if (!operatorSecret) {
    throw new Error("Export ADMIN_RECOVERY_SECRET in your shell (matches Production Vercel).");
  }
  assertRecoveryOperatorSecret(operatorSecret);

  await revokeAndAudit(user.id);

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.joytogetherhomecare.com";
  const invite = await createAndEmailAdminReprovisionInvitation({
    email,
    role: UserRole.SUPER_ADMIN,
    baseUrl: base,
    reprovisionUserId: user.id,
    operatorNote: "production_super_admin_reset",
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        resetStatus: "completed",
        email,
        role: UserRole.SUPER_ADMIN,
        priorCredentialsInvalid: true,
        mfaEnrollmentInvalid: true,
        sessionsRevoked: true,
        invitation: {
          invitationIdPrefix: invite.invitationId.slice(0, 8),
          priorInvitesBurned: invite.priorInvitesBurned,
          resendAccepted: Boolean(invite.resendMessageId),
          resendMessageId: invite.resendMessageId ?? null,
          expiresHours: 48,
          singleUse: true,
        },
        adminLoginUrl: `${base}/admin/login`,
        acceptInvitePath: "/admin/accept-invite",
        note: "Invitation link sent only to email; token not logged.",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.log(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
