"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManagePatientMessages } from "@/lib/patient/permissions";
import { acknowledgeUrgentThread, markMessageRead, postMessage } from "@/lib/patient/messaging";

export async function replyMessageAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManagePatientMessages(user.role)) redirect("/admin/messages?error=unauthorized");

  const threadId = String(formData.get("threadId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!threadId || !body) redirect("/admin/messages?error=invalid");

  const message = await postMessage({ threadId, senderUserId: user.id, body });
  await markMessageRead(message.id, user.id);

  revalidatePath("/admin/messages");
  redirect(`/admin/messages?threadId=${threadId}`);
}

export async function acknowledgeUrgentThreadAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManagePatientMessages(user.role)) redirect("/admin/messages?error=unauthorized");

  const threadId = String(formData.get("threadId") || "");
  if (!threadId) redirect("/admin/messages?error=invalid");

  await acknowledgeUrgentThread(threadId, user.id);
  revalidatePath("/admin/messages");
  redirect(`/admin/messages?threadId=${threadId}`);
}

export const postMessageAction = replyMessageAction;