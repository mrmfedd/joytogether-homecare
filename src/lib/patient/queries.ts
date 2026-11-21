import type { PatientStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { decryptPhi } from "@/lib/patient/phi-crypto";

export type PatientListFilters = {
  status?: PatientStatus | PatientStatus[];
  query?: string;
};

export async function listPatients(filters: PatientListFilters = {}) {
  const statusFilter = filters.status
    ? Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status
    : undefined;

  const q = filters.query?.trim();
  const patients = await prisma.patient.findMany({
    where: {
      status: statusFilter,
      OR: q
        ? [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { publicId: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      coordinator: { select: { id: true, name: true, email: true } },
      assignments: {
        where: { status: { in: ["ACTIVE", "PENDING"] } },
        take: 3,
        include: {
          caregiver: { include: { user: { select: { name: true } } } },
        },
      },
      _count: { select: { alerts: true, careNotes: true } },
    },
    orderBy: [{ status: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
  });

  return patients.map((p) => ({
    ...p,
    internalOfficeNotes: decryptPhi(p.internalOfficeNotes),
  }));
}

export async function getPatientById(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      emergencyContacts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      careInstructions: {
        where: { supersededAt: null },
        orderBy: { effectiveAt: "desc" },
        take: 1,
      },
      coordinator: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      assignments: {
        orderBy: { startDate: "desc" },
        include: {
          caregiver: { include: { user: { select: { name: true, email: true } } } },
          supervisor: { select: { name: true, email: true } },
        },
      },
      visits: { orderBy: { scheduledStart: "desc" }, take: 20 },
      careNotes: { orderBy: { visitDate: "desc" }, take: 10, include: { author: { include: { user: { select: { name: true } } } } } },
      alerts: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!patient) return null;

  const instructions = patient.careInstructions[0];
  return {
    ...patient,
    internalOfficeNotes: decryptPhi(patient.internalOfficeNotes),
    activeInstructions: instructions
      ? {
          ...instructions,
          careInstructions: decryptPhi(instructions.careInstructions),
          mobilityRequirements: decryptPhi(instructions.mobilityRequirements),
          dietaryRestrictions: decryptPhi(instructions.dietaryRestrictions),
          allergies: decryptPhi(instructions.allergies),
          medicalConditions: decryptPhi(instructions.medicalConditions),
          specialPrecautions: decryptPhi(instructions.specialPrecautions),
          additionalInstructions: decryptPhi(instructions.additionalInstructions),
        }
      : null,
  };
}

export async function listOfficeCoordinators() {
  return prisma.user.findMany({
    where: {
      active: true,
      role: { in: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"] },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}