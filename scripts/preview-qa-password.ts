import { randomBytes } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";

const DEFAULT_FILE = join(homedir(), ".config", "joytogether", "preview-qa.env");

/** Loads or creates PREVIEW_QA_PASSWORD without printing the secret. */
export function ensurePreviewQaPassword(): string {
  const fromEnv = process.env.PREVIEW_QA_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 12) return fromEnv;

  const file = process.env.JT_PREVIEW_QA_ENV_FILE?.trim() || DEFAULT_FILE;
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^PREVIEW_QA_PASSWORD=(.+)$/);
      if (m && m[1].trim().length >= 12) {
        process.env.PREVIEW_QA_PASSWORD = m[1].trim();
        return process.env.PREVIEW_QA_PASSWORD;
      }
    }
  }

  const password = randomBytes(24).toString("base64url");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `PREVIEW_QA_PASSWORD=${password}\n`, { mode: 0o600 });
  process.env.PREVIEW_QA_PASSWORD = password;
  console.log(`Preview QA password stored in ${file} (value not logged).`);
  return password;
}
