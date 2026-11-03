"use server";

import { revalidatePath } from "next/cache";
import { requireActiveEmployeeContext } from "@/lib/workforce/profile";
import { prisma } from "@/lib/prisma";

export async function confirmShiftAssignmentAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const assignmentId = String(formData.get("assignmentId") || "");
  if (!assignmentId) return;

  const assignment = await prisma.shiftAssignment.findUnique({
    where: { id: assignmentId },
    include: { shift: true },
  });
  if (!assignment || assignment.profileId !== ctx.profile.id) return;

  await prisma.shiftAssignment.update({
    where: { id: assignmentId },
    data: { confirmationStatus: "CONFIRMED", confirmedAt: new Date() },
  });

  revalidatePath("/employee/schedule");
  revalidatePath("/employee");
}

export async function declineShiftAssignmentAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const assignmentId = String(formData.get("assignmentId") || "");
  if (!assignmentId) return;

  const assignment = await prisma.shiftAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.profileId !== ctx.profile.id) return;

  await prisma.shiftAssignment.update({
    where: { id: assignmentId },
    data: { confirmationStatus: "DECLINED", declinedAt: new Date() },
  });

  revalidatePath("/employee/schedule");
  revalidatePath("/employee");
}
