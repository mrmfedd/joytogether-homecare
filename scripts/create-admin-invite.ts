#!/usr/bin/env npx tsx
/**
 * Create a one-time admin invitation against preview/dev DB and email the accept link.
 * Never prints the raw token.
 *
 * Usage:
 *   ADMIN_INVITE_EMAIL=you@example.com npx tsx scripts/create-admin-invite.ts
 *
 * Requires: DATABASE_URL, RESEND_API_KEY, RESEND_FROM, NEXT_PUBLIC_SITE_URL
 */
import "dotenv/config";
import { createHash, randomBytes } from "crypto";
import { PrismaClient, UserRole } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { site } from "../src/content/site";

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

async function sendInviteEmail(to: string, acceptUrl: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendKey || !resendFrom) {
    throw new Error("RESEND_API_KEY and RESEND_FROM required to deliver invite privately");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [to],
      subject: `${site.name} Admin invitation`,
      text: [
        `You have been invited to ${site.name} Admin.`,
        "",
        "Open this one-time link within 48 hours to set your password:",
        acceptUrl,
        "",
        "If you did not expect this email, ignore it.",
        "",
        "—",
        site.legalName,
        `Phone: ${site.contact.phone}`,
        `Email: ${site.contact.email}`,
        site.url,
      ].join("\n"),
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    throw new Error(json.message || `Resend HTTP ${res.status}`);
  }
  return json.id ?? "sent";
}

async function main() {
  const email = process.env.ADMIN_INVITE_EMAIL?.trim().toLowerCase();
  const role = (process.env.ADMIN_INVITE_ROLE || "SUPER_ADMIN") as UserRole;
  if (!email) throw new Error("Set ADMIN_INVITE_EMAIL");

  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_SITE_URL required");

  // Invalidate any outstanding invites for this email (burn token hashes).
  const outstanding = await prisma.adminInvitation.findMany({
    where: { email, acceptedAt: null },
  });
  for (const row of outstanding) {
    const burned = createHash("sha256")
      .update(`burned-${row.id}-${randomBytes(16).toString("hex")}`)
      .digest("hex");
    await prisma.adminInvitation.update({
      where: { id: row.id },
      data: { expiresAt: new Date(Date.now() - 60_000), tokenHash: burned },
    });
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

  await prisma.adminInvitation.create({
    data: { email, role, tokenHash, expiresAt },
  });

  const acceptUrl = `${base}/admin/accept-invite?token=${token}`;
  const messageId = await sendInviteEmail(email, acceptUrl);

  console.log(`Invitation created for ${email} (${role}).`);
  console.log(`Prior outstanding invites invalidated: ${outstanding.length}.`);
  console.log(`Invite email delivered (Resend message accepted).`);
  console.log(`resend_status=accepted message_ref=${messageId ? "yes" : "no"}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
