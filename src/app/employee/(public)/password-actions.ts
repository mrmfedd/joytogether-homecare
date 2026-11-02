"use server";

import { redirect } from "next/navigation";
import { generateSecureToken, hashPassword, hashToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function requestEmployeePasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.active && user.role === "EMPLOYEE") {
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
      await sendPasswordResetEmail(email, `${base}/employee/reset-password?token=${token}`);
    }
  }

  redirect("/employee/login?reset=sent");
}

export async function resetEmployeePasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 12 || password !== confirm) {
    redirect("/employee/reset-password?error=1");
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { role: true } } },
  });
  if (!record || record.usedAt || record.expiresAt < new Date() || record.user.role !== "EMPLOYEE") {
    redirect("/employee/reset-password?error=1");
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  redirect("/employee/login?reset=done");
}
