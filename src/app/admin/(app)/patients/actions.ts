"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { PatientServiceType, PatientStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { createPatientRecord } from "@/lib/patient/create-patient";
import { canManagePatients, canViewPatientDirectory } from "@/lib/patient/permissions";
import { assertPatientAccess, PatientAccessDeniedError } from "@/lib/patient/access";
import { writePatientAuditEvent } from "@/lib/patient/audit";
import { prisma } from "@/lib/prisma";
import { encryptPhi } from "@/lib/patient/phi-crypto";

const serviceTypes = [
  "SKILLED_NURSING",
  "HOSPICE",
  "PRIVATE_DUTY",
  "PATIENT_TRANSPORTATION",
] as const satisfies readonly PatientServiceType[];

const statusTypes = [
  "ACTIVE",
  "PENDING",
  "ON_HOLD",
  "DISCHARGED",
  "INACTIVE",
] as const satisfies readonly PatientStatus[];

const createPatientSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(1).max(100),
  dateOfBirth: z.string().min(1),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(2).max(2),
  postalCode: z.string().trim().min(5).max(12),
  serviceType: z.enum(serviceTypes),
  startOfCareDate: z.string().optional(),
  status: z.enum(statusTypes),
  coordinatorUserId: z.string().uuid().optional().or(z.literal("")),
  internalOfficeNotes: z.string().trim().max(8000).optional(),
  emergencyName: z.string().trim().min(1).max(120),
  emergencyPhone: z.string().trim().min(7).max(30),
  emergencyRelationship: z.string().trim().min(1).max(80),
  careInstructions: z.string().trim().max(8000).optional(),
  mobilityRequirements: z.string().trim().max(4000).optional(),
  dietaryRestrictions: z.string().trim().max(4000).optional(),
  allergies: z.string().trim().max(4000).optional(),
  medicalConditions: z.string().trim().max(4000).optional(),
  specialPrecautions: z.string().trim().max(4000).optional(),
  additionalInstructions: z.string().trim().max(8000).optional(),
});

function parseDate(value: string | undefined) {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function createPatientAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManagePatients(actor.role)) {
    redirect("/admin/patients?error=unauthorized");
  }

  const parsed = createPatientSchema.safeParse({
    firstName: String(formData.get("firstName") || ""),
    middleName: String(formData.get("middleName") || "") || undefined,
    lastName: String(formData.get("lastName") || ""),
    dateOfBirth: String(formData.get("dateOfBirth") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    addressLine1: String(formData.get("addressLine1") || ""),
    addressLine2: String(formData.get("addressLine2") || "") || undefined,
    city: String(formData.get("city") || ""),
    state: String(formData.get("state") || "").toUpperCase(),
    postalCode: String(formData.get("postalCode") || ""),
    serviceType: String(formData.get("serviceType") || ""),
    startOfCareDate: String(formData.get("startOfCareDate") || ""),
    status: String(formData.get("status") || "PENDING"),
    coordinatorUserId: String(formData.get("coordinatorUserId") || ""),
    internalOfficeNotes: String(formData.get("internalOfficeNotes") || "") || undefined,
    emergencyName: String(formData.get("emergencyName") || ""),
    emergencyPhone: String(formData.get("emergencyPhone") || ""),
    emergencyRelationship: String(formData.get("emergencyRelationship") || ""),
    careInstructions: String(formData.get("careInstructions") || "") || undefined,
    mobilityRequirements: String(formData.get("mobilityRequirements") || "") || undefined,
    dietaryRestrictions: String(formData.get("dietaryRestrictions") || "") || undefined,
    allergies: String(formData.get("allergies") || "") || undefined,
    medicalConditions: String(formData.get("medicalConditions") || "") || undefined,
    specialPrecautions: String(formData.get("specialPrecautions") || "") || undefined,
    additionalInstructions: String(formData.get("additionalInstructions") || "") || undefined,
  });

  if (!parsed.success) {
    redirect(`/admin/patients/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "invalid")}`);
  }

  const data = parsed.data;
  const dob = parseDate(data.dateOfBirth);
  if (!dob) {
    redirect("/admin/patients/new?error=invalid_date_of_birth");
  }

  try {
    const patient = await createPatientRecord({
      ...data,
      email: data.email || undefined,
      coordinatorUserId: data.coordinatorUserId || undefined,
      dateOfBirth: dob,
      startOfCareDate: parseDate(data.startOfCareDate),
      createdByUserId: actor.id,
    });

    await writePatientAuditEvent({
      patientId: patient.id,
      userId: actor.id,
      action: "PATIENT_CREATE",
      entityType: "Patient",
      entityId: patient.id,
    });

    revalidatePath("/admin/patients");
    redirect(`/admin/patients/${patient.id}?created=1`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "create_failed";
    if (msg.includes("Patient") && msg.toLowerCase().includes("does not exist")) {
      redirect("/admin/patients/new?error=migration_required");
    }
    redirect(`/admin/patients/new?error=${encodeURIComponent(msg)}`);
  }
}

const updatePatientStatusSchema = z.object({
  patientId: z.string().uuid(),
  status: z.enum(statusTypes),
});

export async function updatePatientStatusAction(formData: FormData) {
  const actor = await requireAdminSession();
  if (!actor || !canManagePatients(actor.role)) {
    redirect("/admin/patients?error=unauthorized");
  }

  const parsed = updatePatientStatusSchema.safeParse({
    patientId: String(formData.get("patientId") || ""),
    status: String(formData.get("status") || ""),
  });
  if (!parsed.success) redirect("/admin/patients?error=invalid");

  try {
    await assertPatientAccess({ kind: "admin", userId: actor.id, role: actor.role }, parsed.data.patientId);
  } catch (e) {
    if (e instanceof PatientAccessDeniedError) {
      redirect("/admin/patients?error=unauthorized");
    }
    throw e;
  }

  await prisma.patient.update({
    where: { id: parsed.data.patientId },
    data: { status: parsed.data.status },
  });

  await writePatientAuditEvent({
    patientId: parsed.data.patientId,
    userId: actor.id,
    action: "PATIENT_STATUS_UPDATE",
    entityType: "Patient",
    entityId: parsed.data.patientId,
    meta: { status: parsed.data.status },
  });

  revalidatePath(`/admin/patients/${parsed.data.patientId}`);
  revalidatePath("/admin/patients");
  redirect(`/admin/patients/${parsed.data.patientId}`);
}

export async function logPatientChartAccess(patientId: string, userId: string, role: import("@/generated/prisma").UserRole) {
  if (!canViewPatientDirectory(role)) return;
  await writePatientAuditEvent({
    patientId,
    userId,
    action: "PATIENT_CHART_VIEW",
    entityType: "Patient",
    entityId: patientId,
  });
}