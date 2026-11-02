/**
 * Fails if production-like context appears to use the known Preview Neon endpoint.
 * Usage:
 *   VERCEL_ENV=production DATABASE_URL=... npx tsx scripts/verify-env-isolation.ts
 *   ALLOW_PREVIEW_IN_PRODUCTION_CHECK=true to skip (emergency only)
 */
const PREVIEW_HOST_MARKER = "ep-summer-band-bc49hrns";
const PREVIEW_PROJECT = "lucky-fire-28361357";

const vercelEnv = process.env.VERCEL_ENV?.trim() || "";
const nodeEnv = process.env.NODE_ENV?.trim() || "";
const db = process.env.DATABASE_URL?.trim() || "";
const direct = process.env.DIRECT_URL?.trim() || "";
const neonProject = process.env.NEON_PROJECT_ID?.trim() || "";

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

const dbHost = hostOf(db);
const directHost = hostOf(direct);
const looksProduction = vercelEnv === "production" || process.env.FORCE_PRODUCTION_CHECK === "true";

console.log(
  JSON.stringify(
    {
      vercelEnv: vercelEnv || "(unset)",
      nodeEnv: nodeEnv || "(unset)",
      dbHost: dbHost || "(unset)",
      directHost: directHost || "(unset)",
      neonProject: neonProject || "(unset)",
      looksProduction,
    },
    null,
    2,
  ),
);

if (process.env.ALLOW_PREVIEW_IN_PRODUCTION_CHECK === "true") {
  console.warn("ALLOW_PREVIEW_IN_PRODUCTION_CHECK=true — isolation check skipped");
  process.exit(0);
}

if (looksProduction) {
  if (dbHost.includes(PREVIEW_HOST_MARKER) || directHost.includes(PREVIEW_HOST_MARKER)) {
    console.error("FAIL: Production context points at Preview Neon host marker", PREVIEW_HOST_MARKER);
    process.exit(1);
  }
  if (neonProject === PREVIEW_PROJECT) {
    console.error("FAIL: Production context uses Preview NEON_PROJECT_ID", PREVIEW_PROJECT);
    process.exit(1);
  }
}

if (db && direct && hostOf(db) === hostOf(direct) && dbHost.includes("-pooler")) {
  console.warn("WARN: DIRECT_URL host matches pooled DATABASE_URL host; prefer non-pooler for migrations");
}

console.log("PASS: env isolation check");
