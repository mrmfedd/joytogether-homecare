import { prisma } from "@/lib/prisma";
import { writePatientAuditEvent } from "@/lib/patient/audit";

export async function upsertPatientVisitForShift(input: {
  patientId: string;
  shiftId: string;
  assignmentId?: string;
  primaryProfileId?: string;
  supervisorUserId?: string;
  actorUserId: string;
}) {
  const shift = await prisma.shift.findUnique({ where: { id: input.shiftId } });
  if (!shift) throw new Error("Shift not found");

  const assignment = input.assignmentId
    ? await prisma.patientAssignment.findFirst({
        where: { id: input.assignmentId, patientId: input.patientId, status: { in: ["ACTIVE", "PENDING"] } },
      })
    : await prisma.patientAssignment.findFirst({
        where: {
          patientId: input.patientId,
          profileId: input.primaryProfileId,
          status: { in: ["ACTIVE", "PENDING"] },
        },
      });

  const profileId = input.primaryProfileId ?? (await prisma.shiftAssignment.findUnique({ where: { shiftId: input.shiftId } }))?.profileId;

  const visit = await prisma.patientVisit.upsert({
    where: { shiftId: input.shiftId },
    create: {
      patientId: input.patientId,
      shiftId: input.shiftId,
      assignmentId: assignment?.id,
      primaryProfileId: profileId,
      supervisorUserId: input.supervisorUserId,
      scheduledStart: shift.startsAt,
      scheduledEnd: shift.endsAt,
      status: "SCHEDULED",
    },
    update: {
      patientId: input.patientId,
      assignmentId: assignment?.id,
      primaryProfileId: profileId,
      scheduledStart: shift.startsAt,
      scheduledEnd: shift.endsAt,
    },
  });

  await prisma.shift.update({
    where: { id: input.shiftId },
    data: { patientId: input.patientId },
  });

  await writePatientAuditEvent({
    patientId: input.patientId,
    userId: input.actorUserId,
    action: "VISIT_LINK_SHIFT",
    entityType: "PatientVisit",
    entityId: visit.id,
    meta: { shiftId: input.shiftId },
  });

  return visit;
}

export async function listPatientVisits(filters: { patientId?: string; profileId?: string }) {
  return prisma.patientVisit.findMany({
    where: {
      patientId: filters.patientId,
      primaryProfileId: filters.profileId,
    },
    include: {
      patient: { select: { firstName: true, lastName: true, publicId: true } },
      shift: { include: { assignment: { include: { profile: { include: { user: { select: { name: true } } } } } } } },
    },
    orderBy: { scheduledStart: "desc" },
  });
}