"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EmployeeClassification } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { approveShiftResponseTransaction } from "@/lib/workforce/shifts";
import { canManageScheduling } from "@/lib/workforce/permissions";
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
  if (!shift || shift.status === "CANCELED") {
    redirect(`/admin/open-shifts?error=${encodeURIComponent("Shift is not available for an open offer.")}`);
  }

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
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not approve this request.";
    redirect(`/admin/open-shifts?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin/open-shifts");
  revalidatePath("/admin/scheduling");
}

export async function rejectShiftResponseAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const responseId = String(formData.get("responseId") || "");
  if (!responseId) return;

  await prisma.shiftResponse.updateMany({
    where: { id: responseId, status: "PENDING" },
    data: { status: "REJECTED", reviewerId: user.id },
  });

  revalidatePath("/admin/open-shifts");
}

export async function cancelShiftOfferAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const offerId = String(formData.get("offerId") || "");
  if (!offerId) return;

  await prisma.$transaction(async (tx) => {
    await tx.shiftOffer.update({
      where: { id: offerId },
      data: { status: "CANCELED" },
    });
    await tx.shiftResponse.updateMany({
      where: { offerId, status: "PENDING" },
      data: { status: "REJECTED", reviewerId: user.id },
    });
  });

  revalidatePath("/admin/open-shifts");
  revalidatePath("/admin/scheduling");
}
