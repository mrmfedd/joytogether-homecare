import type { EmployeeProfile, User } from "@/generated/prisma";
import { auth, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireEmployeeProfile(sessionUser: SessionUser) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: sessionUser.id },
    include: { user: true },
  });
  if (!profile || profile.user.role !== "EMPLOYEE" || !profile.user.active) {
    return null;
  }
  if (profile.employmentStatus === "INACTIVE") {
    return null;
  }
  return profile;
}

export type EmployeeProfileWithUser = EmployeeProfile & { user: User };

export async function getEmployeeProfileByUserId(userId: string) {
  return prisma.employeeProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

export async function requireActiveEmployeeContext() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const sessionUser = session.user as SessionUser;
  const profile = await requireEmployeeProfile(sessionUser);
  if (!profile) return null;
  return { sessionUser, profile };
}
