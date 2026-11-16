import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const PREFIX = "enc:v1:";
const SALT = "joytogether-phi-field-v1";

function deriveKey() {
  const secret = process.env.PHI_ENCRYPTION_KEY?.trim();
  if (!secret) return null;
  return scryptSync(secret, SALT, 32);
}

/** Encrypt clinically sensitive text at the application layer before persistence. */
export function encryptPhi(plaintext: string | null | undefined): string | null {
  const text = plaintext?.trim();
  if (!text) return null;

  const key = deriveKey();
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("PHI_ENCRYPTION_KEY is required in production.");
    }
    return text;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, encrypted]).toString("base64url");
  return `${PREFIX}${payload}`;
}

export function decryptPhi(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  if (!value.startsWith(PREFIX)) return value;

  const key = deriveKey();
  if (!key) {
    throw new Error("PHI_ENCRYPTION_KEY is required to decrypt protected fields.");
  }

  const raw = Buffer.from(value.slice(PREFIX.length), "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

export function phiEncryptionConfigured() {
  return Boolean(process.env.PHI_ENCRYPTION_KEY?.trim());
}