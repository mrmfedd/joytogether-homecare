import { prisma } from "@/lib/prisma";
import { isPendingEmployeeActivation } from "@/lib/employee/activation";

export async function deleteEmployeeProfilePermanently(profileId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: profileId },
    include: { user: true },
  });
  if (!profile) throw new Error("Employee not found.");

  const pending = isPendingEmployeeActivation({
    passwordHash: profile.user.passwordHash,
    active: profile.user.active,
    employeeProfile: { employmentStatus: profile.employmentStatus },
  });

  if (profile.employmentStatus === "ACTIVE" && profile.user.active) {
    throw new Error("Deactivate this employee before permanent removal.");
  }

  if (!pending && profile.employmentStatus !== "INACTIVE") {
    throw new Error("Only pending or inactive employees can be removed permanently.");
  }

  const email = profile.user.email;

  await prisma.$transaction([
    prisma.employeeInvitation.deleteMany({ where: { email } }),
    prisma.session.deleteMany({ where: { userId: profile.userId } }),
    prisma.user.delete({ where: { id: profile.userId } }),
  ]);

  return { email, profileId: profile.id };
}