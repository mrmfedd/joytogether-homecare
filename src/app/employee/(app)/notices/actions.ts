"use server";

import { revalidatePath } from "next/cache";
import { requireActiveEmployeeContext } from "@/lib/workforce/profile";
import { prisma } from "@/lib/prisma";

export async function markNoticeReadAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const recipientId = String(formData.get("recipientId") || "");
  if (!recipientId) return;

  const recipient = await prisma.staffNoticeRecipient.findUnique({ where: { id: recipientId } });
  if (!recipient || recipient.profileId !== ctx.profile.id) return;

  await prisma.staffNoticeRecipient.update({
    where: { id: recipientId },
    data: { readAt: recipient.readAt ?? new Date() },
  });

  revalidatePath("/employee/notices");
  revalidatePath("/employee");
}

export async function acknowledgeNoticeAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const recipientId = String(formData.get("recipientId") || "");
  if (!recipientId) return;

  const recipient = await prisma.staffNoticeRecipient.findUnique({
    where: { id: recipientId },
    include: { notice: true },
  });
  if (!recipient || recipient.profileId !== ctx.profile.id || !recipient.notice.requiresAck) return;

  await prisma.staffNoticeRecipient.update({
    where: { id: recipientId },
    data: { readAt: recipient.readAt ?? new Date(), ackAt: new Date() },
  });

  revalidatePath("/employee/notices");
}
