#!/usr/bin/env npx tsx
/**
 * Create a one-time admin invitation (run locally against preview/dev DB only).
 * Usage: ADMIN_INVITE_EMAIL=you@example.com npx tsx scripts/create-admin-invite.ts
 */
import { PrismaClient, UserRole } from "../src/generated/prisma";
import { generateInviteToken, hashInviteToken } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_INVITE_EMAIL?.trim().toLowerCase();
  const role = (process.env.ADMIN_INVITE_ROLE || "SUPER_ADMIN") as UserRole;
  if (!email) {
    throw new Error("Set ADMIN_INVITE_EMAIL");
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

  await prisma.adminInvitation.create({
    data: {
      email,
      role,
      tokenHash,
      expiresAt,
    },
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  console.log(`Invitation created for ${email} (${role})`);
  console.log(`Accept URL: ${base}/admin/accept-invite?token=${token}`);
  console.log("Share this link securely. It expires in 48 hours.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
