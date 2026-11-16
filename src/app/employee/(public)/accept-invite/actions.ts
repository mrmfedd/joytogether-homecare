"use server";

import { redirect } from "next/navigation";
import { hashInviteToken, hashPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { validateEmployeeInviteToken } from "@/lib/employee/invitations";
import { prisma } from "@/lib/prisma";

export async function acceptEmployeeInviteAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  const validation = await validateEmployeeInviteToken(token);
  if (!validation.ok) {
    redirect(`/employee/accept-invite?error=${validation.reason}${token ? `&token=${encodeURIComponent(token)}` : ""}`);
  }

  if (password.length < 12 || password !== confirm) {
    redirect(`/employee/accept-invite?error=password&token=${encodeURIComponent(token)}`);
  }

  const invite = await prisma.employeeInvitation.findUnique({
    where: { tokenHash: hashInviteToken(token) },
  });
  if (!invite) {
    redirect("/employee/accept-invite?error=invalid");
  }

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({
    where: { email: invite.email },
    include: { employeeProfile: true },
  });

  let profileId: string;

  if (existing?.employeeProfile) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          active: true,
          ...(name ? { name } : {}),
        },
      }),
      prisma.employeeProfile.update({
        where: { id: existing.employeeProfile.id },
        data: { employmentStatus: "ACTIVE" },
      }),
      prisma.employeeInvitation.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date(), acceptedById: existing.id },
      }),
    ]);
    profileId = existing.employeeProfile.id;
  } else {
    const user = await prisma.user.create({
      data: {
        email: invite.email,
        name: name || invite.email,
        role: "EMPLOYEE",
        passwordHash,
        active: true,
      },
    });

    const profile = await prisma.employeeProfile.create({
      data: {
        userId: user.id,
        classification: invite.classification,
        employmentStatus: "ACTIVE",
      },
    });

    await prisma.employeeInvitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date(), acceptedById: user.id },
    });

    profileId = profile.id;
  }

  await writeAuditLog({
    userId: existing?.id,
    action: existing ? "UPDATE" : "CREATE",
    entity: "EmployeeProfile",
    entityId: profileId,
    meta: {
      via: validation.pendingProfile ? "employee_activation" : "employee_invitation",
      email: invite.email,
    },
  });

  redirect("/employee/login?accepted=1");
}