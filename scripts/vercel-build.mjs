import { execSync } from "node:child_process";

execSync("npx prisma generate", { stdio: "inherit" });

const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
const shouldMigrate =
  dbUrl.length > 0 &&
  !dbUrl.includes("127.0.0.1") &&
  !dbUrl.includes("localhost") &&
  process.env.SKIP_MIGRATIONS !== "true";

if (shouldMigrate) {
  console.log("Applying Prisma migrations…");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const vercelEnv = process.env.VERCEL_ENV?.trim() ?? "";
  const runSeed =
    vercelEnv === "preview" &&
    process.env.RUN_SEED_ON_PREVIEW !== "false" &&
    process.env.SKIP_SEED !== "true";

  if (runSeed) {
    console.log("Running Prisma seed on preview deploy (idempotent upserts)…");
    execSync("npx prisma db seed", { stdio: "inherit" });
  }
} else {
  console.warn("Skipping prisma migrate deploy (no production-like DATABASE_URL).");
}

execSync("npx next build", { stdio: "inherit", env: process.env });
