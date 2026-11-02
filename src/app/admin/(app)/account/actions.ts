"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { generateMfaSecret, verifyMfaCode } from "@/lib/mfa";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function enableMfaAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const code = String(formData.get("code") || "").trim();
  const secret = String(formData.get("secret") || "").trim();
  if (!secret || !verifyMfaCode(secret, code)) {
    return { ok: false as const, error: "Invalid verification code." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true, mfaSecret: secret },
  });
  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "User", entityId: user.id, meta: { mfaEnabled: true } });
  revalidatePath("/admin/account");
  return { ok: true as const };
}

export async function startMfaSetupAction() {
  const user = await requireAdminSession();
  if (!user) return { ok: false as const, error: "Unauthorized" };
  const secret = generateMfaSecret();
  return { ok: true as const, secret };
}
