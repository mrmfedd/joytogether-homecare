import "dotenv/config";
import { defineConfig } from "prisma/config";
import { selectMigrationDatabaseUrl } from "./scripts/migration-database-url.mjs";

/** Migrations: unpooled URL priority in selectMigrationDatabaseUrl; app runtime uses pooled DATABASE_URL. */
function migrationDatabaseUrl(): string {
  return selectMigrationDatabaseUrl(process.env).url;
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
