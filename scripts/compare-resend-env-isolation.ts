#!/usr/bin/env npx tsx
/**
 * Compare Preview vs Production Resend env fingerprints (no secret values).
 */
import { createHash } from "crypto";
import { readFileSync } from "fs";

function parseEnvFile(path: string) {
  const text = readFileSync(path, "utf8");
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function load(path: string) {
  const env = parseEnvFile(path);
  return {
    key: env.RESEND_API_KEY?.trim() || "",
    from: env.RESEND_FROM?.trim() || "",
  };
}

function fp(v: string) {
  return v ? createHash("sha256").update(v).digest("hex").slice(0, 12) : "(unset)";
}

const prod = load(".env.production.local");
const prev = load(".env.preview.local");

const out = {
  production: {
    apiKeyFingerprint: fp(prod.key),
    fromHasTeez: /teezbydesign/i.test(prod.from),
    fromHasJoyTogetherNotifications: /notifications@joytogetherhomecare\.com/i.test(prod.from),
    fromConfigured: Boolean(prod.from),
  },
  preview: {
    apiKeyFingerprint: fp(prev.key),
    fromHasTeez: /teezbydesign/i.test(prev.from),
    fromHasJoyTogetherNotifications: /notifications@joytogetherhomecare\.com/i.test(prev.from),
    fromConfigured: Boolean(prev.from),
  },
  credentialsIsolated: Boolean(prod.key && prev.key && fp(prod.key) !== fp(prev.key)),
  ok:
    Boolean(prod.key && prod.from) &&
    !/teezbydesign/i.test(prod.from) &&
    /notifications@joytogetherhomecare\.com/i.test(prod.from) &&
    Boolean(prev.key) &&
    fp(prod.key) !== fp(prev.key),
};

console.log(JSON.stringify(out, null, 2));
process.exit(out.ok ? 0 : 1);
