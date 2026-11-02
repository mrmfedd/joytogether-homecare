"use server";

import { revalidatePath } from "next/cache";
import type { EmployeeClassification } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { canManageScheduling } from "@/lib/workforce/permissions";
import { approveShiftResponseTransaction } from "@/lib/workforce/shifts";
import { prisma } from "@/lib/prisma";

export async function publishOpenShiftOfferAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const shiftId = String(formData.get("shiftId") || "");
  const requiredClassification = String(formData.get("requiredClassification") || "") as EmployeeClassification | "";
  const requiredCredentialName = String(formData.get("requiredCredentialName") || "").trim() || null;
  const expiresRaw = String(formData.get("expiresAt") || "");
  if (!shiftId) return;

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift || shift.status === "CANCELED") return;

  await prisma.shiftOffer.upsert({
    where: { shiftId },
    create: {
      shiftId,
      status: "OPEN",
      requiredClassification: requiredClassification || null,
      requiredCredentialName,
      expiresAt: expiresRaw ? new Date(expiresRaw) : null,
    },
    update: {
      status: "OPEN",
      requiredClassification: requiredClassification || null,
      requiredCredentialName,
      expiresAt: expiresRaw ? new Date(expiresRaw) : null,
    },
  });

  revalidatePath("/admin/open-shifts");
  revalidatePath("/admin/scheduling");
}

export async function approveShiftResponseAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const responseId = String(formData.get("responseId") || "");
  if (!responseId) return;

  try {
    await approveShiftResponseTransaction(responseId, user.id);
  } catch {
    return;
  }

  revalidatePath("/admin/open-shifts");
  revalidatePath("/admin/scheduling");
}
