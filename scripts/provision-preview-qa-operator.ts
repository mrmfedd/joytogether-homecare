#!/usr/bin/env npx tsx
/** Preview ADMIN role (MFA) for permission tests — separate from SUPER_ADMIN QA account. */
import "./load-local-env";
import { ensurePreviewQaPassword } from "./preview-qa-password";
import bcrypt from "bcryptjs";
import { generateSecret } from "otplib";
import { PrismaClient, UserRole } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const QA_EMAIL = "preview-qa-operator@example.com";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL required");
  if (!connectionString.includes("ep-summer-band-bc49hrns") && process.env.ALLOW_NON_PREVIEW_QA !== "true") {
    throw new Error("Refusing: DATABASE_URL is not the known preview Neon endpoint");
  }
  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });
  return { prisma: new PrismaClient({ adapter: new PrismaPg(pool) }), pool };
}

const { prisma, pool } = createClient();

async function main() {
  const password = ensurePreviewQaPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  const mfaSecret = generateSecret();

  const user = await prisma.user.upsert({
    where: { email: QA_EMAIL },
    create: {
      email: QA_EMAIL,
      name: "Preview QA Admin",
      role: UserRole.ADMIN,
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
      role: UserRole.ADMIN,
    },
  });

  const path = "/tmp/jt-preview-env/qa-operator.json";
  await import("fs/promises").then(async (fs) => {
    await fs.mkdir("/tmp/jt-preview-env", { recursive: true });
    await fs.writeFile(path, JSON.stringify({ email: user.email, password, mfaSecret }), { mode: 0o600 });
  });
  console.log(`Preview QA ADMIN ready: ${user.email}`);
  console.log(`Credentials written to ${path}`);
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
