"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/admin/require-permission";
import { writeAuditLog } from "@/lib/audit";
import { canManageSettings } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { processNotificationRetries } from "@/lib/notifications";

const settingSchema = z.object({
  key: z.string().min(1).max(80),
  valueJson: z.string().min(1),
});

export async function saveSiteSettingAction(formData: FormData) {
  const user = await requirePermission(canManageSettings);
  const parsed = settingSchema.safeParse({
    key: formData.get("key"),
    valueJson: formData.get("valueJson"),
  });
  if (!parsed.success) return { ok: false as const, error: "Invalid setting" };

  let value: unknown;
  try {
    value = JSON.parse(parsed.data.valueJson);
  } catch {
    return { ok: false as const, error: "Value must be valid JSON" };
  }

  await prisma.siteSetting.upsert({
    where: { key: parsed.data.key },
    create: { key: parsed.data.key, value: value as object },
    update: { value: value as object },
  });

  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "SiteSetting", entityId: parsed.data.key });
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function retryNotificationsAction() {
  const user = await requirePermission(canManageSettings);
  const processed = await processNotificationRetries(25);
  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "Notification",
    meta: { processed },
  });
  revalidatePath("/admin/settings");
  return { ok: true as const, processed };
}
