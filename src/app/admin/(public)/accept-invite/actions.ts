"use server";

import { redirect } from "next/navigation";
import { hashInviteToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!token || password.length < 12 || password !== confirm) {
    return;
  }

  const invite = await prisma.adminInvitation.findUnique({
    where: { tokenHash: hashInviteToken(token) },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: invite.email,
      name: name || invite.email,
      role: invite.role,
      passwordHash,
      active: true,
    },
  });

  await prisma.adminInvitation.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date(), acceptedById: user.id },
  });

  redirect("/admin/login?accepted=1");
}
