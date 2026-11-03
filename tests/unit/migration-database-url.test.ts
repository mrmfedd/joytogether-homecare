import { describe, expect, it } from "vitest";
import {
  MIGRATION_URL_ENV_PRIORITY,
  describeMigrationDatabaseUrl,
  selectMigrationDatabaseUrl,
  shouldRunMigrateDuringBuild,
} from "../../scripts/migration-database-url.mjs";

describe("MIGRATION_URL_ENV_PRIORITY", () => {
  it("matches documented order", () => {
    expect(MIGRATION_URL_ENV_PRIORITY).toEqual([
      "DIRECT_URL",
      "DATABASE_URL_UNPOOLED",
      "POSTGRES_URL_NON_POOLING",
      "DATABASE_URL",
    ]);
  });
});

describe("selectMigrationDatabaseUrl", () => {
  it("prefers DIRECT_URL over unpooled and pooled vars", () => {
    const r = selectMigrationDatabaseUrl({
      DIRECT_URL: "postgresql://direct",
      DATABASE_URL_UNPOOLED: "postgresql://unpooled",
      DATABASE_URL: "postgresql://pooled",
    });
    expect(r.source).toBe("DIRECT_URL");
    expect(r.unpooled).toBe(true);
  });

  it("uses DATABASE_URL_UNPOOLED when DIRECT_URL is unset", () => {
    const r = selectMigrationDatabaseUrl({
      DATABASE_URL_UNPOOLED: "postgresql://unpooled",
      POSTGRES_URL_NON_POOLING: "postgresql://non-pooling",
      DATABASE_URL: "postgresql://pooled",
    });
    expect(r.source).toBe("DATABASE_URL_UNPOOLED");
    expect(r.unpooled).toBe(true);
  });

  it("uses POSTGRES_URL_NON_POOLING before DATABASE_URL", () => {
    const r = selectMigrationDatabaseUrl({
      POSTGRES_URL_NON_POOLING: "postgresql://non-pooling",
      DATABASE_URL: "postgresql://pooled",
    });
    expect(r.source).toBe("POSTGRES_URL_NON_POOLING");
    expect(r.unpooled).toBe(true);
  });

  it("falls back to pooled DATABASE_URL when no unpooled vars exist", () => {
    const r = selectMigrationDatabaseUrl({
      DATABASE_URL: "postgresql://pooled",
    });
    expect(r.source).toBe("DATABASE_URL");
    expect(r.unpooled).toBe(false);
  });

  it("uses build placeholder when no env vars are set", () => {
    const r = selectMigrationDatabaseUrl({});
    expect(r.source).toBe("build_placeholder");
    expect(r.url).toContain("127.0.0.1");
  });
  it("simulates Vercel Production Neon (unpooled vars only)", () => {
    const r = selectMigrationDatabaseUrl({
      DATABASE_URL_UNPOOLED: "postgresql://unpooled-host/db",
      DATABASE_URL: "postgresql://pooler-host/db",
    });
    expect(r.source).toBe("DATABASE_URL_UNPOOLED");
    expect(r.unpooled).toBe(true);
  });
});

describe("shouldRunMigrateDuringBuild", () => {
  const previewDb = {
    VERCEL_ENV: "preview",
    DATABASE_URL: "postgresql://pooler/db",
    DATABASE_URL_UNPOOLED: "postgresql://direct/db",
  };

  it("runs on Preview when DATABASE_URL is set", () => {
    expect(shouldRunMigrateDuringBuild(previewDb)).toBe(true);
  });

  it("skips Production build migrate unless RUN_PRODUCTION_MIGRATIONS=true", () => {
    expect(
      shouldRunMigrateDuringBuild({
        ...previewDb,
        VERCEL_ENV: "production",
      }),
    ).toBe(false);
    expect(
      shouldRunMigrateDuringBuild({
        ...previewDb,
        VERCEL_ENV: "production",
        RUN_PRODUCTION_MIGRATIONS: "true",
      }),
    ).toBe(true);
  });

  it("respects SKIP_MIGRATIONS", () => {
    expect(shouldRunMigrateDuringBuild({ ...previewDb, SKIP_MIGRATIONS: "true" })).toBe(false);
  });
});

describe("describeMigrationDatabaseUrl", () => {
  it("does not expose connection strings", () => {
    const d = describeMigrationDatabaseUrl({
      DATABASE_URL_UNPOOLED: "postgresql://user:secret@host/db",
    });
    expect(JSON.stringify(d)).not.toContain("secret");
    expect(JSON.stringify(d)).not.toContain("postgresql://");
    expect(d.source).toBe("DATABASE_URL_UNPOOLED");
    expect(d.unpooled).toBe(true);
    expect(d.hasConfiguredUrl).toBe(true);
  });
});
