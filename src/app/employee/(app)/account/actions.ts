"use server";

import { revalidatePath } from "next/cache";
import { requireEmployeeSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { generateMfaSecret, verifyMfaCode } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";

export async function enableEmployeeMfaAction(formData: FormData) {
  const user = await requireEmployeeSession();
  if (!user) return;

  const code = String(formData.get("code") || "").trim();
  const secret = String(formData.get("secret") || "").trim();
  if (!secret || !verifyMfaCode(secret, code)) {
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true, mfaSecret: secret },
  });
  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "User", entityId: user.id, meta: { mfaEnabled: true } });
  revalidatePath("/employee/account");
}

export async function startEmployeeMfaSetupAction(): Promise<{ ok: true; secret: string } | { ok: false }> {
  const user = await requireEmployeeSession();
  if (!user) return { ok: false };
  return { ok: true, secret: generateMfaSecret() };
}
