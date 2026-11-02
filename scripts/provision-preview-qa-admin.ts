#!/usr/bin/env npx tsx
/**
 * Preview-only QA admin for automated login/MFA/resume tests.
 * Does not email tokens. Requires PREVIEW_QA_PASSWORD (12+ chars).
 *
 * Usage (preview DB only):
 *   PREVIEW_QA_PASSWORD='...' npx tsx scripts/provision-preview-qa-admin.ts
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { generateSecret, generateSync } from "otplib";
import { PrismaClient, UserRole } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const QA_EMAIL = "preview-qa@joytogether.local";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL required");
  if (!connectionString.includes("ep-summer-band-bc49hrns") && process.env.ALLOW_NON_PREVIEW_QA !== "true") {
    throw new Error("Refusing to provision QA admin: DATABASE_URL host is not the known preview Neon endpoint");
  }
  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

async function main() {
  const password = process.env.PREVIEW_QA_PASSWORD;
  if (!password || password.length < 12) throw new Error("PREVIEW_QA_PASSWORD required (12+ chars)");

  const passwordHash = await bcrypt.hash(password, 12);
  const mfaSecret = generateSecret();
  const sampleCode = generateSync({ secret: mfaSecret });

  const user = await prisma.user.upsert({
    where: { email: QA_EMAIL },
    create: {
      email: QA_EMAIL,
      name: "Preview QA",
      role: UserRole.SUPER_ADMIN,
      passwordHash,
      mfaEnabled: true,
      mfaSecret,
      active: true,
    },
    update: {
      passwordHash,
      mfaEnabled: true,
      mfaSecret,
      active: true,
      role: UserRole.SUPER_ADMIN,
    },
  });

  // Write credentials only to a temp file for this session's tests (not the repo).
  const out = {
    email: user.email,
    password,
    mfaSecret,
    sampleCodeAtProvision: sampleCode,
  };
  const path = "/tmp/jt-preview-env/qa-admin.json";
  await import("fs/promises").then((fs) => fs.writeFile(path, JSON.stringify(out), { mode: 0o600 }));
  console.log(`Preview QA admin ready: ${user.email}`);
  console.log(`Credentials written to ${path} (local temp only; not committed).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
