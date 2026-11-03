import type { UserRole } from "@/generated/prisma";

const workforceAdminRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"];

export function isEmployeeRole(role: UserRole) {
  return role === "EMPLOYEE";
}

export function canAccessAdminPortal(role: UserRole) {
  return role !== "EMPLOYEE";
}

export function canAccessEmployeePortal(role: UserRole) {
  return role === "EMPLOYEE";
}

export function canManageWorkforce(role: UserRole) {
  return workforceAdminRoles.includes(role);
}

export function canManageEmployees(role: UserRole) {
  return workforceAdminRoles.includes(role);
}

export function canManageScheduling(role: UserRole) {
  return workforceAdminRoles.includes(role);
}

export function canReviewTimeOff(role: UserRole) {
  return workforceAdminRoles.includes(role);
}

export function canManageNotices(role: UserRole) {
  return workforceAdminRoles.includes(role);
}

export function canReviewTimesheets(role: UserRole) {
  return workforceAdminRoles.includes(role);
}

export function canViewWorkforceReports(role: UserRole) {
  return workforceAdminRoles.includes(role);
}
