"use server";

import { revalidatePath } from "next/cache";
import { requireActiveEmployeeContext } from "@/lib/workforce/profile";
import { isTimeClockEnabled } from "@/lib/workforce/settings";
import { prisma } from "@/lib/prisma";

export async function clockInAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;
  if (!(await isTimeClockEnabled())) return;

  const assignmentId = String(formData.get("shiftAssignmentId") || "") || null;

  const open = await prisma.timeEntry.findFirst({
    where: { profileId: ctx.profile.id, status: "OPEN" },
  });
  if (open) return;

  if (assignmentId) {
    const assignment = await prisma.shiftAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.profileId !== ctx.profile.id) return;
  }

  await prisma.timeEntry.create({
    data: {
      profileId: ctx.profile.id,
      shiftAssignmentId: assignmentId,
      clockInAt: new Date(),
      status: "OPEN",
    },
  });

  revalidatePath("/employee/time-clock");
  revalidatePath("/employee");
}

export async function clockOutAction() {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;
  if (!(await isTimeClockEnabled())) return;

  const open = await prisma.timeEntry.findFirst({
    where: { profileId: ctx.profile.id, status: "OPEN" },
    orderBy: { clockInAt: "desc" },
  });
  if (!open) return;

  await prisma.timeEntry.update({
    where: { id: open.id },
    data: { clockOutAt: new Date(), status: "CLOSED" },
  });

  revalidatePath("/employee/time-clock");
  revalidatePath("/employee");
}
