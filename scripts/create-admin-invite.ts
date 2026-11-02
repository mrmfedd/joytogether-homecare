#!/usr/bin/env npx tsx
/**
 * Create a one-time admin invitation (run locally against preview/dev DB only).
 * Usage: ADMIN_INVITE_EMAIL=you@example.com npx tsx scripts/create-admin-invite.ts
 */
import "dotenv/config";
import { createHash, randomBytes } from "crypto";
import { PrismaClient, UserRole } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL required");
  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

async function main() {
  const email = process.env.ADMIN_INVITE_EMAIL?.trim().toLowerCase();
  const role = (process.env.ADMIN_INVITE_ROLE || "SUPER_ADMIN") as UserRole;
  if (!email) {
    throw new Error("Set ADMIN_INVITE_EMAIL");
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
