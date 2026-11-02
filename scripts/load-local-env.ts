/**
 * Loads env files for CLI scripts. Later files override earlier ones.
 * `.env.preview.local` is created by `vercel env pull` and is gitignored.
 */
import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });
config({ path: ".env.preview.local", override: true });
