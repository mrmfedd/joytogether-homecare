"use server";

import { redirect } from "next/navigation";
import { hashPassword, hashToken, generateSecureToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.active) {
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
    }
  }

  redirect("/admin/login?reset=sent");
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 12 || password !== confirm) {
    redirect("/admin/reset-password?error=1");
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    redirect("/admin/reset-password?error=1");
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  redirect("/admin/login?reset=done");
}
