import type { UserRole } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function requirePermission(check: (role: UserRole) => boolean) {
  const user = await requireAdminSession();
  if (!user || !check(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}
