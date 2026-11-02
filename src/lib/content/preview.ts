import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET required for preview tokens");
  return s;
}

export function createPreviewToken(pageKey: string, ttlSeconds = 60 * 30) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${pageKey}:${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyPreviewToken(pageKey: string, token: string) {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return false;
    const payload = Buffer.from(body, "base64url").toString("utf8");
    const [key, expStr] = payload.split(":");
    if (key !== pageKey) return false;
    const exp = Number(expStr);
    if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function previewContentUrl(pageKey: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const token = createPreviewToken(pageKey);
  return `${base}/preview/content/${encodeURIComponent(pageKey)}?token=${token}`;
}
