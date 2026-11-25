"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EmployeeClassification } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  createEmployeeActivationWithoutEmail,
  regenerateEmployeeActivationLink,
  emailPendingEmployeeActivation,
} from "@/lib/employee/invitations";
import { canManageEmployees } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { publicSiteBaseUrl } from "@/lib/site-url";
import { deleteEmployeeProfilePermanently } from "@/lib/employee/delete-profile";

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

export async function regenerateEmployeeActivationLinkAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManageEmployees(actor.role)) {
    redirect("/admin/employees?error=unauthorized");
  }

  const profileId = String(formData.get("profileId") || "");
  if (!profileId) {
    redirect("/admin/employees?error=missing_profile");
  }

  let result: Awaited<ReturnType<typeof regenerateEmployeeActivationLink>>;
  try {
    result = await regenerateEmployeeActivationLink({
      profileId,
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


/** Sends one activation email after an explicit administrator click. */
export async function sendEmployeeActivationEmailAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManageEmployees(actor.role)) redirect("/admin/employees?error=unauthorized");

  const profileId = String(formData.get("profileId") ?? "");
  if (!profileId) redirect("/admin/employees?error=missing_profile");

  try {
    await emailPendingEmployeeActivation({
      profileId,
      baseUrl: publicSiteBaseUrl(),
      createdByUserId: actor.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send activation email.";
    redirect(`/admin/employees?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/employees");
  redirect("/admin/employees?emailsAccepted=1");
}

/** Only executes after a confirm click; no scheduled/background sends.
 * Cap batches to avoid serverless timeouts and mail-provider rate limits.
 */
export async function sendAllPendingActivationEmailsAction() {
  const actor = await requireAdminSession();
  if (!actor || !canManageEmployees(actor.role)) redirect("/admin/employees?error=unauthorized");

  const pending = await prisma.employeeProfile.findMany({
    where: {
      employmentStatus: "INVITED",
      user: { active: false, role: "EMPLOYEE", passwordHash: null },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  // Exclude recent successful sends, so subsequent batches progress through a large roster.
  const recentSends = await prisma.auditLog.findMany({
    where: {
      entity: "EmployeeProfile",
      action: "UPDATE",
      createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
    },
    select: { entityId: true, meta: true },
  });
  const recentlyContacted = new Set(
    recentSends
      .filter((row) =>
        row.entityId &&
        row.meta &&
        typeof row.meta === "object" &&
        !Array.isArray(row.meta) &&
        "via" in row.meta &&
        row.meta.via === "email_activation"
      )
      .map((row) => row.entityId as string),
  );
  const eligible = pending.filter((profile) => !recentlyContacted.has(profile.id));
  // Cap each administrator-triggered batch; show how many remain.
  const MAX_BATCH = 40;
  let accepted = 0;
  let failed = 0;
  for (const profile of eligible.slice(0, MAX_BATCH)) {
    try {
      await emailPendingEmployeeActivation({
        profileId: profile.id,
        baseUrl: publicSiteBaseUrl(),
        createdByUserId: actor.id,
      });
      accepted += 1;
    } catch {
      failed += 1;
    }
    // Resend's default API send rate is limited; avoid a burst.
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "EmployeeActivationEmailBatch",
    meta: {
      attempted: Math.min(eligible.length, MAX_BATCH),
      skippedRecent: pending.length - eligible.length,
      providerAccepted: accepted,
      failedOrSkipped: failed,
      remainingUnattempted: Math.max(0, eligible.length - MAX_BATCH),
    },
  });
  revalidatePath("/admin/employees");
  redirect(`/admin/employees?emailsAccepted=${accepted}&emailsFailed=${failed}&emailsRemaining=${Math.max(0, eligible.length - MAX_BATCH)}`);
}

export async function deleteEmployeeProfileAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManageEmployees(actor.role)) {
    redirect("/admin/employees?error=unauthorized");
  }

  const profileId = String(formData.get("profileId") || "");
  if (!profileId) redirect("/admin/employees?error=missing_profile");

  try {
    const removed = await deleteEmployeeProfilePermanently(profileId);
    await writeAuditLog({
      userId: actor.id,
      action: "DELETE",
      entity: "EmployeeProfile",
      entityId: removed.profileId,
      meta: { email: removed.email, permanent: true },
    });
  } catch (e) {
    redirect(`/admin/employees?error=${encodeURIComponent(employeeCreateErrorParam(e))}`);
  }

  revalidatePath("/admin/employees");
  redirect("/admin/employees?deleted=1");
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