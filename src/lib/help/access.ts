import type { HelpAudience, HelpArticle, UserRole } from "@/generated/prisma";
import { canAccessAdmin } from "@/lib/permissions";
import { canAccessEmployeePortal } from "@/lib/workforce/permissions";

export function canAccessHelpAudience(role: UserRole, audience: HelpAudience): boolean {
  if (audience === "ADMIN") return canAccessAdmin(role);
  if (audience === "EMPLOYEE") return canAccessEmployeePortal(role);
  return false;
}

export function canViewHelpArticle(
  role: UserRole,
  article: Pick<HelpArticle, "allowedRoles" | "published"> & { category: { audience: HelpAudience } },
): boolean {
  if (!article.published) return false;
  if (!canAccessHelpAudience(role, article.category.audience)) return false;
  if (article.allowedRoles.length === 0) return true;
  return article.allowedRoles.includes(role);
}

export function canManageHelpContent(role: UserRole) {
  return role === "SUPER_ADMIN";
}
