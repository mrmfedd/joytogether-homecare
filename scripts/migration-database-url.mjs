/**
 * Prisma migrate deploy connection selection (Neon).
 * Runtime app queries use pooled DATABASE_URL via @prisma/adapter-pg — not this module.
 */

export const MIGRATION_URL_ENV_PRIORITY = [
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
];

const BUILD_PLACEHOLDER =
  "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";

/** Hosts used for CI placeholders and local builds — never migrate during `npm run build`. */
export function isNonMigratableBuildDatabaseUrl(url) {
  if (!url || url === BUILD_PLACEHOLDER) return true;
  if (url.includes("127.0.0.1")) return true;
  try {
    const normalized = url.replace(/^postgres(ql)?:\/\//, "http://");
    const host = new URL(normalized).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/** @param {Record<string, string | undefined>} env */
export function selectMigrationDatabaseUrl(env) {
  for (const source of MIGRATION_URL_ENV_PRIORITY) {
    const url = env[source]?.trim();
    if (url) {
      return {
        url,
        source,
        unpooled: source !== "DATABASE_URL",
      };
    }
  }
  return {
    url: BUILD_PLACEHOLDER,
    source: "build_placeholder",
    unpooled: false,
  };
}

/** @param {Record<string, string | undefined>} env */
export function describeMigrationDatabaseUrl(env) {
  const { source, unpooled } = selectMigrationDatabaseUrl(env);
  return {
    source,
    unpooled,
    hasConfiguredUrl: source !== "build_placeholder",
  };
}

/** @param {Record<string, string | undefined>} env */
export function shouldRunMigrateDuringBuild(env) {
  const vercelEnv = env.VERCEL_ENV?.trim() ?? "";
  const migrationMeta = describeMigrationDatabaseUrl(env);
  const productionMigrateAllowed = env.RUN_PRODUCTION_MIGRATIONS === "true";
  const selected = selectMigrationDatabaseUrl(env);

  if (env.SKIP_MIGRATIONS === "true") return false;
  if (!migrationMeta.hasConfiguredUrl) return false;
  if (isNonMigratableBuildDatabaseUrl(selected.url)) return false;

  if (vercelEnv === "preview") return true;
  if (vercelEnv === "production" && productionMigrateAllowed) return true;

  return false;
}
