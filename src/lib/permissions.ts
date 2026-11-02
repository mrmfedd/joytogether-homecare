import type { UserRole } from "@/generated/prisma";

const leadRoles: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CARE_COORDINATOR",
  "VIEWER",
];

const leadContactRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"];

const contentRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"];

const recruiterRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "RECRUITER"];

const settingsRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN"];

const userAdminRoles: UserRole[] = ["SUPER_ADMIN"];

export function hasRole(role: UserRole, allowed: UserRole[]) {
  return allowed.includes(role);
}

export function canAccessAdmin(role: UserRole) {
  return role !== "VIEWER" || false; // all admin users should have explicit roles
}

export function canViewLeads(role: UserRole) {
  return hasRole(role, leadRoles);
}

export function canViewLeadContact(role: UserRole) {
  return hasRole(role, leadContactRoles);
}

export function canManageLeads(role: UserRole) {
  return hasRole(role, ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"]);
}

export function canManageContent(role: UserRole) {
  return hasRole(role, contentRoles);
}

export function canManageServices(role: UserRole) {
  return hasRole(role, ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
}

export function canApproveClinicalCopy(role: UserRole) {
  return hasRole(role, ["SUPER_ADMIN", "ADMIN"]);
}

export function canManageCareers(role: UserRole) {
  return hasRole(role, recruiterRoles);
}

export function canManageSettings(role: UserRole) {
  return hasRole(role, settingsRoles);
}

export function canManageUsers(role: UserRole) {
  return hasRole(role, userAdminRoles);
}

export function canViewReports(role: UserRole) {
  return hasRole(role, ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"]);
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***-***-${digits.slice(-4)}`;
}
