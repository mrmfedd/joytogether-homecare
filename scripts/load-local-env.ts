/**
 * Loads env files for CLI scripts. Later files override earlier ones.
 * `.env.preview.local` / `.env.production.local` come from `vercel env pull` and are gitignored.
 */
import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });
config({ path: ".env.preview.local", override: true });
config({ path: ".env.production.local", override: true });
