import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { passwordHash: true, active: true },
  });
  if (!user?.active || !user.passwordHash) return false;

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return false;

  await setPasskeyReauthCookie(input.userId);
  return true;
}
