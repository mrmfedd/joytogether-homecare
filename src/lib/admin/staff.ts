import { prisma } from "@/lib/prisma";

export async function listAssignableStaff() {
  return prisma.user.findMany({
    where: {
      active: true,
      role: { in: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR", "RECRUITER"] },
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}
