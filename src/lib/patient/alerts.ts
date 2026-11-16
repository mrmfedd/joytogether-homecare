import type { PatientAlertPriority, PatientAlertType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { assertPatientAccess } from "@/lib/patient/access";
import { writePatientAuditEvent } from "@/lib/patient/audit";
import { encryptPhi } from "@/lib/patient/phi-crypto";

export async function createPatientAlert(input: {
  patientId: string;
  type: PatientAlertType;
  priority: PatientAlertPriority;
  title: string;
  description: string;
  reporterUserId?: string;
  reporterProfileId?: string;
  assigneeUserId?: string;
}) {
  const alert = await prisma.$transaction(async (tx) => {
    const row = await tx.patientAlert.create({
      data: {
        patientId: input.patientId,
        type: input.type,
        priority: input.priority,
        title: input.title,
        description: encryptPhi(input.description) ?? input.description,
        reporterUserId: input.reporterUserId,
        reporterProfileId: input.reporterProfileId,
        assigneeUserId: input.assigneeUserId,
        status: "NEW",
      },
    });
    await tx.patientAlertEvent.create({
      data: { alertId: row.id, actorUserId: input.reporterUserId ?? input.assigneeUserId, toStatus: "NEW", note: "Created" },
    });
    return row;
  });

  await writePatientAuditEvent({
    patientId: input.patientId,
    userId: input.reporterUserId ?? input.assigneeUserId,
    action: "ALERT_CREATE",
    entityType: "PatientAlert",
    entityId: alert.id,
  });

  return alert;
}

export async function updateAlertStatus(input: {
  alertId: string;
  toStatus: import("@/generated/prisma").PatientAlertStatus;
  actorUserId: string;
  note?: string;
  resolutionNotes?: string;
}) {
  const existing = await prisma.patientAlert.findUnique({ where: { id: input.alertId } });
  if (!existing) throw new Error("Alert not found");

  const alert = await prisma.$transaction(async (tx) => {
    const row = await tx.patientAlert.update({
      where: { id: input.alertId },
      data: {
        status: input.toStatus,
        resolutionNotes: input.resolutionNotes,
        acknowledgedAt: input.toStatus === "ACKNOWLEDGED" ? new Date() : undefined,
        resolvedAt: input.toStatus === "RESOLVED" || input.toStatus === "CLOSED" ? new Date() : undefined,
      },
    });
    await tx.patientAlertEvent.create({
      data: {
        alertId: input.alertId,
        actorUserId: input.actorUserId,
        fromStatus: existing.status,
        toStatus: input.toStatus,
        note: input.note,
      },
    });
    return row;
  });

  await writePatientAuditEvent({
    patientId: alert.patientId,
    userId: input.actorUserId,
    action: "ALERT_STATUS",
    entityType: "PatientAlert",
    entityId: alert.id,
    meta: { status: input.toStatus },
  });

  return alert;
}

export async function reportConcernFromEmployee(input: {
  patientId: string;
  profileId: string;
  userId: string;
  title: string;
  description: string;
  priority: PatientAlertPriority;
}) {
  await assertPatientAccess({ kind: "employee", userId: input.userId, profileId: input.profileId, role: "EMPLOYEE" }, input.patientId);
  return createPatientAlert({
    patientId: input.patientId,
    type: "CAREGIVER_CONCERN",
    priority: input.priority,
    title: input.title,
    description: input.description,
    reporterProfileId: input.profileId,
    reporterUserId: input.userId,
  });
}