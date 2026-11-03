"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { generateMfaSecret, verifyMfaCode } from "@/lib/mfa";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function enableMfaAction(formData: FormData) {
  const user = await requireAdminSession();
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
  revalidatePath("/admin/account");
  return;
}

export async function startMfaSetupAction(): Promise<{ ok: true; secret: string } | { ok: false }> {
  const user = await requireAdminSession();
  if (!user) return { ok: false };
  const secret = generateMfaSecret();
  return { ok: true, secret };
}
