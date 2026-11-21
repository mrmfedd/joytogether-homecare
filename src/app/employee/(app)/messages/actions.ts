"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { markMessageRead, postMessage } from "@/lib/patient/messaging";

export async function employeeReplyMessageAction(formData: FormData) {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const threadId = String(formData.get("threadId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!threadId || !body) redirect("/employee/messages?error=invalid");

  const message = await postMessage({ threadId, senderUserId: user.id, body });
  await markMessageRead(message.id, user.id);

  revalidatePath("/employee/messages");
  redirect(`/employee/messages?threadId=${threadId}`);
}