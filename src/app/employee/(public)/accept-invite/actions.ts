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
    redirect(`/employee/accept-invite?error=${validation.reason}`);
  }

  if (password.length < 12 || password !== confirm) {
    redirect("/employee/accept-invite?error=password");
  }

  const invite = await prisma.employeeInvitation.findUnique({
    where: { tokenHash: hashInviteToken(token) },
  });
  if (!invite) {
    redirect("/employee/accept-invite?error=invalid");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: invite.email,
      name: name || invite.email,
      role: "EMPLOYEE",
      passwordHash,
      active: true,
    },
  });

  await prisma.employeeProfile.create({
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

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "EmployeeProfile",
    entityId: user.id,
    meta: { via: "employee_invitation", email: invite.email },
  });

  redirect("/employee/login?accepted=1");
}
