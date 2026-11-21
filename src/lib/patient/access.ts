import type { PatientAssignmentStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  canEmployeeAccessPatientPortal,
  canManagePatients,
  canViewPatientDirectory,
} from "@/lib/patient/permissions";
import type { UserRole } from "@/generated/prisma";

const activeAssignmentStatuses: PatientAssignmentStatus[] = ["ACTIVE", "PENDING"];

export type PatientAccessActor =
  | { kind: "admin"; userId: string; role: UserRole }
  | { kind: "employee"; userId: string; profileId: string; role: UserRole };

export async function employeeHasActivePatientAssignment(profileId: string, patientId: string) {
  const row = await prisma.patientAssignment.findFirst({
    where: {
      patientId,
      profileId,
      status: { in: activeAssignmentStatuses },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    select: { id: true },
  });
  return row != null;
}

/** Server-side gate: employees see only actively assigned patients; office roles use RBAC. */
export async function assertPatientAccess(actor: PatientAccessActor, patientId: string) {
  if (actor.kind === "admin") {
    if (!canViewPatientDirectory(actor.role)) {
      throw new PatientAccessDeniedError("Patient directory access denied");
    }
    return { mode: "office" as const };
  }

  if (!canEmployeeAccessPatientPortal(actor.role)) {
    throw new PatientAccessDeniedError("Employee portal required");
  }

  const allowed = await employeeHasActivePatientAssignment(actor.profileId, patientId);
  if (!allowed) {
    throw new PatientAccessDeniedError("No active assignment for this patient");
  }
  return { mode: "assignment" as const };
}

export async function listAssignedPatientIdsForProfile(profileId: string) {
  const rows = await prisma.patientAssignment.findMany({
    where: {
      profileId,
      status: { in: activeAssignmentStatuses },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    select: { patientId: true },
    distinct: ["patientId"],
  });
  return rows.map((r) => r.patientId);
}

export function canMutatePatientRecord(role: UserRole) {
  return canManagePatients(role);
}

export class PatientAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatientAccessDeniedError";
  }
}