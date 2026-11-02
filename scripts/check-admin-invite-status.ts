/**
 * Reports whether an admin invitation is still valid without printing tokens.
 * Usage: ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com npx tsx scripts/check-admin-invite-status.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const email = (process.env.ADMIN_INVITE_EMAIL || "joytogetherhomecare@gmail.com").toLowerCase();
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL required");
const connectionString: string = rawUrl;

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const host = new URL(connectionString).hostname;
  const invites = await prisma.adminInvitation.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      email: true,
      acceptedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  const now = new Date();
  const rows = invites.map((i) => ({
    idPrefix: i.id.slice(0, 8),
    email: i.email,
    accepted: Boolean(i.acceptedAt),
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
    currentlyValid: !i.acceptedAt && i.expiresAt > now,
  }));

  const outstandingValid = rows.filter((r) => r.currentlyValid).length;
  console.log(
    JSON.stringify(
      {
        dbHost: host,
        email,
        outstandingValid,
        invites: rows,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
