"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EmployeeClassification } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAndEmailEmployeeInvitation } from "@/lib/employee/invitations";
import { canManageEmployees } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { publicSiteBaseUrl } from "@/lib/site-url";

function employeeInviteErrorParam(error: unknown): string {
  const raw = error instanceof Error ? error.message : "invite_failed";
  if (raw.includes("RESEND_API_KEY")) {
    return "Email delivery is not configured (RESEND_API_KEY / RESEND_FROM).";
  }
  if (raw.includes("EmployeeInvitation") && raw.toLowerCase().includes("does not exist")) {
    return "Workforce database tables are missing. Run production migrations and redeploy.";
  }
  return raw;
}

export async function inviteEmployeeAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageEmployees(user.role)) {
    redirect("/admin/employees?error=unauthorized");
  }

  const email = String(formData.get("email") || "").trim();
  const classification = String(formData.get("classification") || "") as EmployeeClassification;
  if (!email || !classification) {
    redirect("/admin/employees?error=missing_fields");
  }

  try {
    await createAndEmailEmployeeInvitation({
      email,
      classification,
      baseUrl: publicSiteBaseUrl(),
      createdByUserId: user.id,
    });
  } catch (e) {
    redirect(`/admin/employees?error=${encodeURIComponent(employeeInviteErrorParam(e))}`);
  }

  revalidatePath("/admin/employees");
  redirect("/admin/employees?sent=1");
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