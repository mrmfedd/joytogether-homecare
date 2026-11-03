"use server";

import { revalidatePath } from "next/cache";
import type { EmployeeClassification } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAndEmailEmployeeInvitation } from "@/lib/employee/invitations";
import { canManageEmployees } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";

export async function inviteEmployeeAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageEmployees(user.role)) return;

  const email = String(formData.get("email") || "").trim();
  const classification = String(formData.get("classification") || "") as EmployeeClassification;
  if (!email || !classification) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  await createAndEmailEmployeeInvitation({
    email,
    classification,
    baseUrl,
    createdByUserId: user.id,
  });

  revalidatePath("/admin/employees");
}

export async function deactivateEmployeeProfileAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageEmployees(user.role)) return;

  const profileId = String(formData.get("profileId") || "");
  if (!profileId) return;

  const profile = await prisma.employeeProfile.findUnique({
    where: { id: profileId },
    include: { user: true },
  });
  if (!profile) return;

  await prisma.$transaction([
    prisma.employeeProfile.update({
      where: { id: profileId },
      data: { employmentStatus: "INACTIVE" },
    }),
    prisma.user.update({
      where: { id: profile.userId },
      data: { active: false },
    }),
  ]);

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "EmployeeProfile",
    entityId: profileId,
    meta: { employmentStatus: "INACTIVE" },
  });

  revalidatePath("/admin/employees");
}
