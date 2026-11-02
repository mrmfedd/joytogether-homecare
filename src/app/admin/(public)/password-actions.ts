"use server";

import { hashPassword, hashToken, generateSecureToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email) return { ok: true as const };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.active) return { ok: true as const };

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await sendPasswordResetEmail(email, `${base}/admin/reset-password?token=${token}`);

  return { ok: true as const };
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 12 || password !== confirm) {
    return { ok: false as const, error: "Password must match and be at least 12 characters." };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false as const, error: "Reset link invalid or expired." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true as const };
}
