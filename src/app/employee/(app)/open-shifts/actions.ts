"use server";

import { revalidatePath } from "next/cache";
import { requireActiveEmployeeContext } from "@/lib/workforce/profile";
import { claimOpenShiftTransaction, employeeMeetsOfferRequirements } from "@/lib/workforce/shifts";
import { prisma } from "@/lib/prisma";

export async function claimOpenShiftAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const offerId = String(formData.get("offerId") || "");
  if (!offerId) return;

  const offer = await prisma.shiftOffer.findUnique({
    where: { id: offerId },
    include: { shift: true },
  });
  if (!offer) return;

  const credentials = await prisma.employeeCredential.findMany({ where: { profileId: ctx.profile.id } });
  if (
    !employeeMeetsOfferRequirements(
      ctx.profile.classification,
      credentials,
      offer.requiredClassification,
      offer.requiredCredentialName,
    )
  ) {
    return;
  }

  try {
    await claimOpenShiftTransaction(offerId, ctx.profile.id);
  } catch {
    return;
  }

  revalidatePath("/employee/open-shifts");
  revalidatePath("/employee");
}
