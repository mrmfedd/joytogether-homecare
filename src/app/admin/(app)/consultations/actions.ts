"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { canManageLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import type { ConsultationStatus } from "@/generated/prisma";

export async function updateConsultationAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) {
    throw new Error("Unauthorized");
  }

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ConsultationStatus;
  const scheduledRaw = String(formData.get("scheduledAt") || "");
  const notes = String(formData.get("notes") || "").trim();

  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;

  const updated = await prisma.consultation.update({
    where: { id },
    data: {
      status,
      scheduledAt,
      internalNotes: notes || undefined,
      assignedToId: user.id,
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "Consultation",
    entityId: id,
    meta: { status },
  });

  revalidatePath("/admin/consultations");
  revalidatePath(`/admin/leads/${updated.leadId}`);
}
