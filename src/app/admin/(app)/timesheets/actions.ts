"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canReviewTimesheets } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";

export async function approveTimesheetCorrectionAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canReviewTimesheets(user.role)) return;

  const correctionId = String(formData.get("correctionId") || "");
  const approve = formData.get("approve") === "1";
  const reviewNote = String(formData.get("reviewNote") || "").trim() || null;
  if (!correctionId) return;

  const correction = await prisma.timesheetCorrection.findUnique({
    where: { id: correctionId },
    include: { timeEntry: true },
  });
  if (!correction || correction.status !== "PENDING") return;

  if (approve) {
    await prisma.$transaction(async (tx) => {
      await tx.timesheetCorrection.update({
        where: { id: correctionId },
        data: { status: "APPROVED", reviewerId: user.id, reviewNote },
      });
      await tx.timeEntry.update({
        where: { id: correction.timeEntryId },
        data: {
          clockInAt: correction.requestedInAt ?? correction.timeEntry.clockInAt,
          clockOutAt: correction.requestedOutAt ?? correction.timeEntry.clockOutAt,
          status: "CLOSED",
        },
      });
    });
  } else {
    await prisma.timesheetCorrection.update({
      where: { id: correctionId },
      data: { status: "REJECTED", reviewerId: user.id, reviewNote },
    });
  }

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "TimesheetCorrection",
    entityId: correctionId,
    meta: { approved: approve },
  });

  revalidatePath("/admin/timesheets");
}
