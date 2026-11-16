import { prisma } from "@/lib/prisma";
import { decryptPhi } from "@/lib/patient/phi-crypto";
import { assertPatientAccess } from "@/lib/patient/access";

export async function listEmployeeAssignedPatients(profileId: string, userId: string) {
  const assignments = await prisma.patientAssignment.findMany({
    where: {
      profileId,
      status: { in: ["ACTIVE", "PENDING"] },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    include: {
      patient: {
        include: {
          visits: {
            where: { scheduledStart: { gte: new Date() } },
            orderBy: { scheduledStart: "asc" },
            take: 1,
          },
          alerts: {
            where: { status: { in: ["NEW", "ACKNOWLEDGED", "IN_PROGRESS"] }, priority: { in: ["HIGH", "URGENT"] } },
            take: 2,
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return assignments.map((a) => ({
    assignmentId: a.id,
    status: a.status,
    serviceType: a.serviceType,
    patient: {
      id: a.patient.id,
      publicId: a.patient.publicId,
      firstName: a.patient.firstName,
      lastName: a.patient.lastName,
      nextVisit: a.patient.visits[0] ?? null,
      alerts: a.patient.alerts,
    },
  }));
}

export async function getEmployeePatientDetail(profileId: string, userId: string, patientId: string) {
  await assertPatientAccess({ kind: "employee", userId, profileId, role: "EMPLOYEE" }, patientId);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      emergencyContacts: { where: { isPrimary: true }, take: 1 },
      careInstructions: { where: { supersededAt: null }, orderBy: { effectiveAt: "desc" }, take: 1 },
      visits: {
        where: { OR: [{ primaryProfileId: profileId }, { shift: { assignment: { profileId } } }] },
        orderBy: { scheduledStart: "desc" },
        take: 30,
      },
      careNotes: {
        where: { OR: [{ profileId }, { status: "SUBMITTED" }] },
        orderBy: { visitDate: "desc" },
        take: 20,
        include: { author: { include: { user: { select: { name: true } } } } },
      },
    },
  });
  if (!patient) return null;

  const instructions = patient.careInstructions[0];
  return {
    id: patient.id,
    publicId: patient.publicId,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    serviceType: patient.serviceType,
    emergency: patient.emergencyContacts[0] ?? null,
    instructions: instructions
      ? {
          careInstructions: decryptPhi(instructions.careInstructions),
          mobilityRequirements: decryptPhi(instructions.mobilityRequirements),
          dietaryRestrictions: decryptPhi(instructions.dietaryRestrictions),
          allergies: decryptPhi(instructions.allergies),
          medicalConditions: decryptPhi(instructions.medicalConditions),
          specialPrecautions: decryptPhi(instructions.specialPrecautions),
          additionalInstructions: decryptPhi(instructions.additionalInstructions),
        }
      : null,
    visits: patient.visits,
    notes: patient.careNotes,
  };
}