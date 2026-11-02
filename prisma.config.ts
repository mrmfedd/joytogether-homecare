import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/** Neon: use DIRECT_URL (non-pooled) for migrations; runtime uses pooled DATABASE_URL via adapter. */
function migrationDatabaseUrl(): string {
  return process.env.DIRECT_URL?.trim() || env("DATABASE_URL");
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
