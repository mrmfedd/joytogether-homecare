import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Neon: use DIRECT_URL (non-pooled) for migrations; runtime uses pooled DATABASE_URL via adapter. */
function migrationDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  if (direct) return direct;
  if (pooled) return pooled;
  // `prisma generate` during Vercel/CI build does not open a connection; config still needs a URL string.
  return "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationDatabaseUrl(),
  },
});
