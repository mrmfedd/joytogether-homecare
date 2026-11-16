"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EmployeeClassification } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createEmployeeActivationWithoutEmail } from "@/lib/employee/invitations";
import { canManageEmployees } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { publicSiteBaseUrl } from "@/lib/site-url";

const employeeClassifications = [
  "CAREGIVER",
  "HOME_HEALTH_AIDE",
  "CNA",
  "LPN",
  "RN",
  "HOSPICE_STAFF",
  "TRANSPORTATION_STAFF",
  "SCHEDULER",
  "SUPERVISOR",
] as const satisfies readonly EmployeeClassification[];

const createEmployeeManuallySchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email required."),
  name: z.string().trim().min(1, "Name is required.").max(200),
  classification: z.enum(employeeClassifications),
  phone: z.string().trim().max(50).optional(),
  department: z.string().trim().max(100).optional(),
});

function formOptionalString(value: FormDataEntryValue | null) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function employeeCreateErrorParam(error: unknown): string {
  const raw = error instanceof Error ? error.message : "create_failed";
  if (raw.includes("EmployeeInvitation") && raw.toLowerCase().includes("does not exist")) {
    return "Workforce database tables are missing. Run production migrations and redeploy.";
  }
  if (raw.includes("EmployeeProfile") && raw.toLowerCase().includes("does not exist")) {
    return "Workforce database tables are missing. Run production migrations and redeploy.";
  }
  return raw;
}

export async function createEmployeeManuallyAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManageEmployees(actor.role)) {
    redirect("/admin/employees?error=unauthorized");
  }

  const parsed = createEmployeeManuallySchema.safeParse({
    email: String(formData.get("email") || ""),
    name: String(formData.get("name") || ""),
    classification: String(formData.get("classification") || ""),
    phone: formOptionalString(formData.get("phone")),
    department: formOptionalString(formData.get("department")),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "invalid_fields";
    redirect(`/admin/employees?error=${encodeURIComponent(message)}`);
  }

  const { email, name, classification, phone, department } = parsed.data;

  let result: Awaited<ReturnType<typeof createEmployeeActivationWithoutEmail>>;
  try {
    result = await createEmployeeActivationWithoutEmail({
      email,
      name,
      classification,
      phone,
      department,
      baseUrl: publicSiteBaseUrl(),
      createdByUserId: actor.id,
    });
  } catch (e) {
    redirect(`/admin/employees?error=${encodeURIComponent(employeeCreateErrorParam(e))}`);
  }

  revalidatePath("/admin/employees");
  redirect(
    `/admin/employees?created=1&activation=${encodeURIComponent(result.activationUrl)}&expires=${encodeURIComponent(result.expiresAt.toISOString())}`,
  );
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