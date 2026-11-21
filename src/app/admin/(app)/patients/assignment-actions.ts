"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { PatientServiceType } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { assertPatientAccess, PatientAccessDeniedError } from "@/lib/patient/access";
import { createPatientAssignment, endPatientAssignment } from "@/lib/patient/assignments";
import { canManagePatients } from "@/lib/patient/permissions";

const serviceTypes = [
  "SKILLED_NURSING",
  "HOSPICE",
  "PRIVATE_DUTY",
  "PATIENT_TRANSPORTATION",
] as const satisfies readonly PatientServiceType[];

const assignSchema = z.object({
  patientId: z.string().uuid(),
  profileId: z.string().uuid(),
  serviceType: z.enum(serviceTypes),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  supervisorUserId: z.string().uuid().optional().or(z.literal("")),
  instructions: z.string().max(8000).optional(),
});

export async function createAssignmentAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManagePatients(actor.role)) {
    redirect("/admin/patients/assignments?error=unauthorized");
  }

  const parsed = assignSchema.safeParse({
    patientId: String(formData.get("patientId") || ""),
    profileId: String(formData.get("profileId") || ""),
    serviceType: String(formData.get("serviceType") || ""),
    startDate: String(formData.get("startDate") || ""),
    endDate: String(formData.get("endDate") || ""),
    supervisorUserId: String(formData.get("supervisorUserId") || ""),
    instructions: String(formData.get("instructions") || "") || undefined,
  });

  if (!parsed.success) {
    redirect("/admin/patients/assignments?error=invalid");
  }

  try {
    await assertPatientAccess({ kind: "admin", userId: actor.id, role: actor.role }, parsed.data.patientId);
  } catch (e) {
    if (e instanceof PatientAccessDeniedError) redirect("/admin/patients/assignments?error=unauthorized");
    throw e;
  }

  const start = new Date(parsed.data.startDate);
  const end = parsed.data.endDate ? new Date(parsed.data.endDate) : undefined;

  await createPatientAssignment({
    patientId: parsed.data.patientId,
    profileId: parsed.data.profileId,
    serviceType: parsed.data.serviceType,
    startDate: start,
    endDate: end,
    supervisorUserId: parsed.data.supervisorUserId || undefined,
    instructions: parsed.data.instructions,
    actorUserId: actor.id,
  });

  revalidatePath("/admin/patients/assignments");
  revalidatePath(`/admin/patients/${parsed.data.patientId}`);
  redirect(`/admin/patients/${parsed.data.patientId}`);
}

export async function endAssignmentAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManagePatients(actor.role)) {
    redirect("/admin/patients/assignments?error=unauthorized");
  }

  const assignmentId = String(formData.get("assignmentId") || "");
  const patientId = String(formData.get("patientId") || "");
  const endedReason = String(formData.get("endedReason") || "") || undefined;
  if (!assignmentId) redirect("/admin/patients/assignments?error=invalid");

  try {
    await assertPatientAccess({ kind: "admin", userId: actor.id, role: actor.role }, patientId);
  } catch (e) {
    if (e instanceof PatientAccessDeniedError) redirect("/admin/patients/assignments?error=unauthorized");
    throw e;
  }

  await endPatientAssignment({ assignmentId, actorUserId: actor.id, endedReason });
  revalidatePath("/admin/patients/assignments");
  revalidatePath(`/admin/patients/${patientId}`);
  redirect(`/admin/patients/${patientId}`);
}