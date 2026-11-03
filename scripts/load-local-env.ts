/**
 * Loads env files for CLI scripts. Later files override earlier ones.
 * `.env.preview.local` / `.env.production.local` come from `vercel env pull` and are gitignored.
 */
import { existsSync, readFileSync } from "fs";
import { config } from "dotenv";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val === "[SENSITIVE]") continue;
    process.env[m[1]] = val;
  }
}

config();
config({ path: ".env.local", override: true });
config({ path: ".env.preview.local", override: true });
/** Production pull overrides Preview when loaded last — skip unless explicitly requested. */
if (process.env.JT_USE_PRODUCTION_ENV === "true") {
  config({ path: ".env.production.local", override: true });
}
const explicit = process.env.JT_PREVIEW_ENV_FILE?.trim();
if (explicit) {
  config({ path: explicit, override: true });
}
/** Gitignored Production Neon + Resend (never commit). Wins over Preview pulls. */
const prodEnvFile = process.env.JT_PROD_ENV_FILE?.trim();
if (prodEnvFile) {
  loadEnvFile(prodEnvFile);
  if (process.env.DATABASE_URL_UNPOOLED) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  }
}
