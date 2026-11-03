"use server";

import type { HelpAudience } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { requireEmployeeSession } from "@/lib/auth";
import { searchHelpArticles } from "@/lib/help/search";

export async function searchAdminHelpAction(query: string, categorySlug?: string) {
  const user = await requireAdminSession();
  if (!user) return [];
  return searchHelpArticles("ADMIN", user.role, query, categorySlug);
}

export async function searchEmployeeHelpAction(query: string, categorySlug?: string) {
  const user = await requireEmployeeSession();
  if (!user) return [];
  return searchHelpArticles("EMPLOYEE", "EMPLOYEE", query, categorySlug);
}

export async function searchHelpForAudience(audience: HelpAudience, query: string, categorySlug?: string) {
  if (audience === "ADMIN") return searchAdminHelpAction(query, categorySlug);
  return searchEmployeeHelpAction(query, categorySlug);
}
