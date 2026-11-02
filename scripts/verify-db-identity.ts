/**
 * Prints non-secret database host info to verify preview vs production targets.
 * Usage: DATABASE_URL=... npx tsx scripts/verify-db-identity.ts
 */
const url = process.env.DATABASE_URL?.trim();
const direct = process.env.DIRECT_URL?.trim();

function summarize(label: string, value?: string) {
  if (!value) {
    console.log(`${label}: (not set)`);
    return;
  }
  try {
    const parsed = new URL(value);
    console.log(`${label}: host=${parsed.hostname} db=${parsed.pathname.replace("/", "") || "default"}`);
  } catch {
    console.log(`${label}: (invalid URL)`);
  }
}

summarize("DATABASE_URL", url);
summarize("DIRECT_URL", direct);

if (process.env.NODE_ENV === "production" && url?.includes("preview")) {
  console.warn("WARNING: production NODE_ENV with preview-like URL");
}
