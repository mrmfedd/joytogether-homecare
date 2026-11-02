"use server";

import { revalidatePath } from "next/cache";
import { requireActiveEmployeeContext } from "@/lib/workforce/profile";
import { prisma } from "@/lib/prisma";

export async function createTimeOffRequestAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const startRaw = String(formData.get("startDate") || "");
  const endRaw = String(formData.get("endDate") || "");
  const reason = String(formData.get("reason") || "").trim() || null;
  if (!startRaw || !endRaw) return;

  const startDate = new Date(startRaw);
  const endDate = new Date(endRaw);
  if (endDate < startDate) return;

  await prisma.employeeTimeOffRequest.create({
    data: {
      profileId: ctx.profile.id,
      startDate,
      endDate,
      reason,
      status: "PENDING",
    },
  });

  revalidatePath("/employee/time-off");
  revalidatePath("/employee");
}
