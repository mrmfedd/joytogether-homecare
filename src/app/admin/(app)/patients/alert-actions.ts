"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { createPatientAlert, updateAlertStatus } from "@/lib/patient/alerts";
import { assertPatientAccess, PatientAccessDeniedError } from "@/lib/patient/access";
import { canManagePatientAlerts } from "@/lib/patient/permissions";
import type { PatientAlertStatus } from "@/generated/prisma";

export async function updateAlertStatusAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManagePatientAlerts(user.role)) redirect("/admin/patients/alerts?error=unauthorized");

  const alertId = String(formData.get("alertId") || "");
  const status = String(formData.get("status") || "") as PatientAlertStatus;
  const resolutionNotes = String(formData.get("resolutionNotes") || "") || undefined;
  if (!alertId) redirect("/admin/patients/alerts?error=invalid");

  await updateAlertStatus({ alertId, toStatus: status, actorUserId: user.id, resolutionNotes });
  revalidatePath("/admin/patients/alerts");
  redirect("/admin/patients/alerts");
}

export async function createFollowUpAlertAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManagePatientAlerts(user.role)) redirect("/admin/patients/alerts?error=unauthorized");

  const patientId = String(formData.get("patientId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!patientId || !title || !description) redirect("/admin/patients/alerts?error=invalid");

  try {
    await assertPatientAccess({ kind: "admin", userId: user.id, role: user.role }, patientId);
  } catch (e) {
    if (e instanceof PatientAccessDeniedError) redirect("/admin/patients/alerts?error=unauthorized");
    throw e;
  }

  await createPatientAlert({
    patientId,
    type: "FOLLOW_UP_REQUIRED",
    priority: "NORMAL",
    title,
    description,
    assigneeUserId: user.id,
    reporterUserId: user.id,
  });

  revalidatePath("/admin/patients/alerts");
  revalidatePath(`/admin/patients/${patientId}`);
  redirect(`/admin/patients/alerts?patientId=${patientId}`);
}