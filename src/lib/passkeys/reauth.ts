import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifyMfaCode } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma";
import { hasPasskeySecondFactor } from "@/lib/passkeys/mfa-policy";

export const PASSKEY_REAUTH_COOKIE = "jt_passkey_reauth";
const REAUTH_TTL_SEC = 5 * 60;

function signReauthPayload(userId: string, exp: number) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET required");
  return createHmac("sha256", secret).update(`${userId}:${exp}`).digest("base64url");
}

export async function setPasskeyReauthCookie(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + REAUTH_TTL_SEC;
  const sig = signReauthPayload(userId, exp);
  const value = `${userId}.${exp}.${sig}`;
  const jar = await cookies();
  jar.set(PASSKEY_REAUTH_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REAUTH_TTL_SEC,
  });
}

export async function clearPasskeyReauthCookie() {
  const jar = await cookies();
  jar.delete(PASSKEY_REAUTH_COOKIE);
}

export async function hasValidPasskeyReauth(userId: string) {
  const jar = await cookies();
  const raw = jar.get(PASSKEY_REAUTH_COOKIE)?.value;
  if (!raw) return false;
  const [id, expStr, sig] = raw.split(".");
  if (!id || !expStr || !sig || id !== userId) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = signReauthPayload(id, exp);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function verifyPasskeyReauthentication(input: {
  userId: string;
  role: UserRole;
  password: string;
  mfaCode?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { passwordHash: true, mfaEnabled: true, mfaSecret: true, role: true, active: true },
  });
  if (!user?.active || !user.passwordHash) return false;

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return false;

  const needsTotp =
    (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.mfaEnabled) && Boolean(user.mfaSecret);
  const hasPasskeys = await hasPasskeySecondFactor(user.id);

  if (needsTotp && user.mfaSecret) {
    const code = input.mfaCode?.trim();
    if (!code || !verifyMfaCode(user.mfaSecret, code)) {
      if (!hasPasskeys) return false;
    }
  }

  await setPasskeyReauthCookie(user.id);
  return true;
}