#!/usr/bin/env npx tsx
/**
 * Preview-only QA employee for workforce / cross-portal tests.
 * Does not email tokens. Requires PREVIEW_QA_PASSWORD (12+ chars).
 *
 * Usage:
 *   PREVIEW_QA_PASSWORD='...' npx tsx scripts/provision-preview-qa-employee.ts
 */
import "./load-local-env";
import { ensurePreviewQaPassword } from "./preview-qa-password";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, EmployeeClassification } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const QA_EMAIL = "preview-qa-employee@example.com";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL required");
  if (!connectionString.includes("ep-summer-band-bc49hrns") && process.env.ALLOW_NON_PREVIEW_QA !== "true") {
    throw new Error("Refusing to provision QA employee: DATABASE_URL host is not the known preview Neon endpoint");
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

  await prisma.user.updateMany({
    where: { email: "preview-qa-employee@joytogether.local" },
    data: { active: false },
  });
  await prisma.employeeProfile.updateMany({
    where: { user: { email: "preview-qa-employee@joytogether.local" } },
    data: { employmentStatus: "INACTIVE" },
  });

  const user = await prisma.user.upsert({
    where: { email: QA_EMAIL },
    create: {
      email: QA_EMAIL,
      name: "Preview QA Employee",
      role: UserRole.EMPLOYEE,
      passwordHash,
      mfaEnabled: false,
      active: true,
    },
    update: {
      passwordHash,
      active: true,
      role: UserRole.EMPLOYEE,
    },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      classification: EmployeeClassification.CNA,
      employmentStatus: "ACTIVE",
    },
    update: {
      classification: EmployeeClassification.CNA,
      employmentStatus: "ACTIVE",
    },
  });

  const profile = await prisma.employeeProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const out = { email: user.email, password, profileId: profile.id };
  const path = "/tmp/jt-preview-env/qa-employee.json";
  await import("fs/promises").then(async (fs) => {
    await fs.mkdir("/tmp/jt-preview-env", { recursive: true });
    await fs.writeFile(path, JSON.stringify(out), { mode: 0o600 });
  });
  console.log(`Preview QA employee ready: ${user.email}`);
  console.log(`Credentials written to ${path} (local temp only; not committed).`);
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
