import type { PatientAssignmentStatus, PatientServiceType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { writePatientAuditEvent } from "@/lib/patient/audit";

export async function listPatientAssignments(filters?: { patientId?: string; profileId?: string }) {
  return prisma.patientAssignment.findMany({
    where: {
      patientId: filters?.patientId,
      profileId: filters?.profileId,
    },
    include: {
      patient: { select: { id: true, publicId: true, firstName: true, lastName: true, status: true } },
      caregiver: { include: { user: { select: { name: true, email: true } } } },
      supervisor: { select: { name: true, email: true } },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function createPatientAssignment(input: {
  patientId: string;
  profileId: string;
  serviceType: PatientServiceType;
  startDate: Date;
  endDate?: Date;
  supervisorUserId?: string;
  instructions?: string;
  actorUserId: string;
  status?: PatientAssignmentStatus;
}) {
  const assignment = await prisma.patientAssignment.create({
    data: {
      patientId: input.patientId,
      profileId: input.profileId,
      serviceType: input.serviceType,
      startDate: input.startDate,
      endDate: input.endDate,
      supervisorUserId: input.supervisorUserId,
      instructions: input.instructions,
      status: input.status ?? "ACTIVE",
    },
  });

  await writePatientAuditEvent({
    patientId: input.patientId,
    userId: input.actorUserId,
    action: "ASSIGNMENT_CREATE",
    entityType: "PatientAssignment",
    entityId: assignment.id,
    meta: { profileId: input.profileId },
  });

  return assignment;
}

export async function endPatientAssignment(input: {
  assignmentId: string;
  actorUserId: string;
  endedReason?: string;
}) {
  const existing = await prisma.patientAssignment.findUnique({ where: { id: input.assignmentId } });
  if (!existing) throw new Error("Assignment not found.");

  const assignment = await prisma.patientAssignment.update({
    where: { id: input.assignmentId },
    data: {
      status: "ENDED",
      endDate: existing.endDate ?? new Date(),
      endedReason: input.endedReason,
    },
  });

  await writePatientAuditEvent({
    patientId: assignment.patientId,
    userId: input.actorUserId,
    action: "ASSIGNMENT_END",
    entityType: "PatientAssignment",
    entityId: assignment.id,
  });

  return assignment;
}