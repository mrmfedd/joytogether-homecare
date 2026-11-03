"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma";
import { createAndEmailAdminInvitation } from "@/lib/admin/invitations";
import { requireAdminSession, hashPassword, hashInviteToken } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canManageUsers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { validateAdminInviteToken } from "@/lib/admin/invitations";

export async function sendAdminInviteAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageUsers(user.role)) {
    redirect("/admin/users?error=unauthorized");
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "ADMIN") as UserRole;

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "";
    await createAndEmailAdminInvitation({
      email,
      role,
      baseUrl: base,
      createdByUserId: user.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "invite_failed";
    redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?sent=1");
}

export async function setUserActiveAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManageUsers(actor.role)) return;

  const userId = String(formData.get("userId") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!userId || userId === actor.id) return;

  await prisma.user.update({ where: { id: userId }, data: { active } });
  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "User",
    entityId: userId,
    meta: { active },
  });
  revalidatePath("/admin/users");
}

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  const validation = await validateAdminInviteToken(token);
  if (!validation.ok) {
    redirect(`/admin/accept-invite?error=${validation.reason}`);
  }

  if (password.length < 12 || password !== confirm) {
    redirect("/admin/accept-invite?error=password");
  }

  const invite = await prisma.adminInvitation.findUnique({
    where: { tokenHash: hashInviteToken(token) },
  });
  if (!invite) {
    redirect("/admin/accept-invite?error=invalid");
  }

  const passwordHash = await hashPassword(password);

  if (invite.reprovisionUserId) {
    await prisma.user.update({
      where: { id: invite.reprovisionUserId },
      data: {
        name: name || invite.email,
        role: invite.role,
        passwordHash,
        active: true,
        mfaEnabled: false,
        mfaSecret: null,
        sessionVersion: { increment: 1 },
      },
    });
    await prisma.session.deleteMany({ where: { userId: invite.reprovisionUserId } });
    await prisma.adminInvitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date(), acceptedById: invite.reprovisionUserId },
    });
    await writeAuditLog({
      userId: invite.reprovisionUserId,
      action: "UPDATE",
      entity: "User",
      entityId: invite.reprovisionUserId,
      meta: { via: "reprovision_invitation", email: invite.email, role: invite.role },
    });
    redirect("/admin/login?accepted=1");
  }

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

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "User",
    entityId: user.id,
    meta: { via: "invitation", email: invite.email },
  });

  redirect("/admin/login?accepted=1");
}
