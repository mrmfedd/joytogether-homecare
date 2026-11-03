import { createHash, timingSafeEqual } from "crypto";
import { hashPassword, hashToken } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export function hashRecoveryToken(token: string) {
  return hashToken(token);
}

export async function validateAdminRecoveryToken(token: string) {
  if (!token.trim()) return { ok: false as const, reason: "missing" as const };
  const record = await prisma.adminAccountRecoveryToken.findUnique({
    where: { tokenHash: hashRecoveryToken(token) },
    include: { user: { select: { id: true, email: true, role: true, active: true } } },
  });
  if (!record) return { ok: false as const, reason: "invalid" as const };
  if (record.usedAt) return { ok: false as const, reason: "used" as const };
  if (record.expiresAt < new Date()) return { ok: false as const, reason: "expired" as const };
  if (!record.user.active) return { ok: false as const, reason: "inactive" as const };
  if (record.user.role === "EMPLOYEE") return { ok: false as const, reason: "invalid" as const };
  return {
    ok: true as const,
    userId: record.user.id,
    email: record.user.email,
    role: record.user.role,
    tokenId: record.id,
  };
}

export async function completeAdminAccountRecovery(input: {
  token: string;
  password: string;
  ip?: string;
}) {
  const validation = await validateAdminRecoveryToken(input.token);
  if (!validation.ok) return validation;

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: validation.userId },
      data: {
        passwordHash,
        mfaEnabled: false,
        mfaSecret: null,
      },
    }),
    prisma.session.deleteMany({ where: { userId: validation.userId } }),
    prisma.adminAccountRecoveryToken.update({
      where: { id: validation.tokenId },
      data: { usedAt: new Date() },
    }),
    prisma.adminAccountRecoveryToken.updateMany({
      where: { userId: validation.userId, usedAt: null, id: { not: validation.tokenId } },
      data: { usedAt: new Date() },
    }),
  ]);

  await writeAuditLog({
    userId: validation.userId,
    action: "UPDATE",
    entity: "User",
    entityId: validation.userId,
    meta: {
          event: "ADMIN_ACCOUNT_RECOVERY_COMPLETED",
          mfaReset: true,
          sessionsInvalidated: true,
        },
    ip: input.ip,
  });

  return { ok: true as const, email: validation.email };
}

export function assertRecoveryOperatorSecret(provided: string) {
  const expected = process.env.ADMIN_RECOVERY_SECRET?.trim();
  if (!expected || expected.length < 32) {
    throw new Error("ADMIN_RECOVERY_SECRET must be set (32+ chars) in the target environment.");
  }
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Recovery operator authorization failed.");
  }
}
