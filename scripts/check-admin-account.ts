/**
 * Preview admin account + invitation status (no tokens).
 * Usage: ADMIN_INVITE_EMAIL=mrmfedd@gmail.com npx tsx scripts/check-admin-account.ts
 */
import "./load-local-env";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const email = (process.env.ADMIN_INVITE_EMAIL || "").trim().toLowerCase();
if (!email) throw new Error("Set ADMIN_INVITE_EMAIL");

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL required (use .env.preview.local or JT_PREVIEW_ENV_FILE)");

const connectionString = rawUrl;
const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const host = new URL(connectionString).hostname;
  const previewMarker = host.includes("ep-summer-band") || process.env.NEON_PROJECT_ID === "lucky-fire-28361357";

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, active: true, mfaEnabled: true, createdAt: true },
  });

  const invites = await prisma.adminInvitation.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, role: true, acceptedAt: true, expiresAt: true, createdAt: true },
  });

  const now = new Date();
  const outstandingValid = invites.filter((i) => !i.acceptedAt && i.expiresAt > now);

  console.log(
    JSON.stringify(
      {
        dbHost: host,
        previewNeonExpected: previewMarker,
        email,
        userAccount: user
          ? {
              idPrefix: user.id.slice(0, 8),
              role: user.role,
              active: user.active,
              mfaEnabled: user.mfaEnabled,
            }
          : null,
        outstandingValidInvites: outstandingValid.length,
        latestInviteRole: invites[0]?.role ?? null,
        invites: invites.map((i) => ({
          idPrefix: i.id.slice(0, 8),
          role: i.role,
          accepted: Boolean(i.acceptedAt),
          expiresAt: i.expiresAt.toISOString(),
          currentlyValid: !i.acceptedAt && i.expiresAt > now,
        })),
        ownerAutoInvited: email === "joytogetherhomecare@gmail.com" ? undefined : "check separately",
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
