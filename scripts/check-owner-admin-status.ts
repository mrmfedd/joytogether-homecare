#!/usr/bin/env npx tsx
/**
 * Owner onboarding status (no tokens). Preview or local DB via DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/check-owner-admin-status.ts
 *   OWNER_EMAIL=joytogetherhomecare@gmail.com npx tsx scripts/check-owner-admin-status.ts
 */
import "./load-local-env";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const email = (process.env.OWNER_EMAIL || "joytogetherhomecare@gmail.com").trim().toLowerCase();
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL required (.env.local)");

const pool = new pg.Pool({
  connectionString: rawUrl,
  ssl: rawUrl.includes("localhost") ? undefined : { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const host = new URL(rawUrl).hostname;
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      mfaEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const invites = await prisma.adminInvitation.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      acceptedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  const inviteSummary = invites.map((i) => ({
    idPrefix: i.id.slice(0, 8),
    accepted: Boolean(i.acceptedAt),
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
    currentlyValid: !i.acceptedAt && i.expiresAt > now,
  }));

  const outstandingValid = inviteSummary.filter((r) => r.currentlyValid).length;

  const accountReady = Boolean(user?.active && user.mfaEnabled && user.role !== "EMPLOYEE");
  const needsAcceptInvite = !user && outstandingValid > 0;
  const needsResendInvite = !user && outstandingValid === 0;
  const needsMfa = Boolean(user?.active && !user.mfaEnabled && user.role !== "EMPLOYEE");

  console.log(
    JSON.stringify(
      {
        dbHost: host,
        email,
        account: user
          ? {
              exists: true,
              role: user.role,
              active: user.active,
              mfaEnabled: user.mfaEnabled,
              createdAt: user.createdAt.toISOString(),
            }
          : { exists: false },
        invites: {
          outstandingValid,
          recent: inviteSummary,
        },
        readiness: {
          ownerAdminReady: accountReady,
          needsAcceptInvite,
          needsResendInvite,
          needsMfaEnrollment: needsMfa,
        },
        secureResend: needsResendInvite || needsAcceptInvite
          ? "Resend via /admin/users (Super Admin) or: ADMIN_INVITE_EMAIL=<email> npx tsx scripts/create-admin-invite.ts"
          : needsMfa
            ? "Owner must sign in at /admin/login → Account → Security to enable MFA (required for Admin roles)."
            : accountReady
              ? "No invite resend required."
              : "Review account state manually.",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
