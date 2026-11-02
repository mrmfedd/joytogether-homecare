"use server";

import { revalidatePath } from "next/cache";
import type { TimeOffStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canReviewTimeOff } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";

export async function reviewTimeOffRequestAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canReviewTimeOff(user.role)) return;

  const requestId = String(formData.get("requestId") || "");
  const status = String(formData.get("status") || "") as TimeOffStatus;
  const reviewNote = String(formData.get("reviewNote") || "").trim() || null;
  if (!requestId || (status !== "APPROVED" && status !== "DENIED")) return;

  await prisma.employeeTimeOffRequest.update({
    where: { id: requestId },
    data: { status, reviewerId: user.id, reviewNote },
  });

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "EmployeeTimeOffRequest",
    entityId: requestId,
    meta: { status },
  });

  revalidatePath("/admin/time-off");
}
