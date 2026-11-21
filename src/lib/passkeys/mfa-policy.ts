import type { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export function roleRequiresSecondFactor(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EMPLOYEE";
}

/** TOTP MFA enabled on account */
export function hasTotpMfa(user: { mfaEnabled: boolean; mfaSecret: string | null }) {
  return Boolean(user.mfaEnabled && user.mfaSecret);
}

export async function countUserPasskeys(userId: string) {
  try {
    return await prisma.userPasskey.count({ where: { userId } });
  } catch {
    return 0;
  }
}

/** Passkey with user verification may satisfy MFA policy when at least one passkey is registered. */
export async function hasPasskeySecondFactor(userId: string) {
  return (await countUserPasskeys(userId)) > 0;
}

export async function adminMustEnrollSecondFactor(userId: string, role: UserRole, mfaEnabled: boolean) {
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") return false;
  if (mfaEnabled) return false;
  return !(await hasPasskeySecondFactor(userId));
}

export function passkeyLoginSatisfiesTotpRequirement(input: {
  role: UserRole;
  userVerified: boolean;
  hasPasskeys: boolean;
}) {
  if (!input.userVerified || !input.hasPasskeys) return false;
  return roleRequiresSecondFactor(input.role);
}