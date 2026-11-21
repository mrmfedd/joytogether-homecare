import type { EmployeeClassification, UserRole } from "@/generated/prisma";

/** Office roles that may register patients and manage assignments (minimum-necessary enforced in queries). */
const patientAdminRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"];

/** Office roles that may review documentation and coordinate follow-up (read-heavy + review actions). */
const patientClinicalOfficeRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"];

/** Admin-portal roles with read-only patient directory access. */
const patientReadRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR", "VIEWER"];

const fieldCareClassifications: EmployeeClassification[] = [
  "CAREGIVER",
  "HOME_HEALTH_AIDE",
  "CNA",
  "LPN",
  "RN",
  "HOSPICE_STAFF",
  "TRANSPORTATION_STAFF",
  "SUPERVISOR",
];

export function canManagePatients(role: UserRole) {
  return patientAdminRoles.includes(role);
}

export function canViewPatientDirectory(role: UserRole) {
  return patientReadRoles.includes(role);
}

export function canReviewPatientCareNotes(role: UserRole) {
  return patientClinicalOfficeRoles.includes(role);
}

export function canManagePatientMessages(role: UserRole) {
  return patientClinicalOfficeRoles.includes(role);
}

export function canManagePatientAlerts(role: UserRole) {
  return patientClinicalOfficeRoles.includes(role);
}

export function isFieldCareEmployee(classification: EmployeeClassification) {
  return fieldCareClassifications.includes(classification);
}

export function canEmployeeAccessPatientPortal(role: UserRole) {
  return role === "EMPLOYEE";
}