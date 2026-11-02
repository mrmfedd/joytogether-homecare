import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@/generated/prisma";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { verifyMfaCode } from "@/lib/mfa";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function loginRateLimited(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  loginAttempts.set(key, entry);
  return entry.count > 8;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mfaCode: { label: "MFA code", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");
        const mfaCode = String(credentials?.mfaCode || "").trim();
        if (!email || !password) return null;

        if (loginRateLimited(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const privileged =
          user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.mfaEnabled;
        if (privileged && user.mfaSecret) {
          if (!mfaCode || !verifyMfaCode(user.mfaSecret, mfaCode)) {
            return null;
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await writeAuditLog({
          userId: user.id,
          action: "LOGIN",
          entity: "User",
          entityId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashInviteToken(token: string) {
  return hashToken(token);
}

export function generateInviteToken() {
  return randomBytes(32).toString("hex");
}

export function generateSecureToken() {
  return randomBytes(32).toString("hex");
}

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
};

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return null;
  }
  return session.user as SessionUser;
}
