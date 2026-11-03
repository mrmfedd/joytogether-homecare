/**
 * Loads env files for CLI scripts. Later files override earlier ones.
 * `.env.preview.local` / `.env.production.local` come from `vercel env pull` and are gitignored.
 */
import { config } from "dotenv";

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
