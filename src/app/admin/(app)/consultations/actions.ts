"use server";

import { revalidatePath } from "next/cache";
import type { ConsultationStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canManageLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

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

export async function createAdminConsultationAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) return;

  const leadId = String(formData.get("leadId") || "").trim();
  const scheduledRaw = String(formData.get("scheduledAt") || "").trim();
  const assigneeId = String(formData.get("assigneeId") || user.id).trim();
  const notes = String(formData.get("internalNotes") || "").trim();
  if (!leadId) return;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
  const status: ConsultationStatus = scheduledAt ? "SCHEDULED" : "REQUESTED";

  await prisma.$transaction(async (tx) => {
    await tx.consultation.create({
      data: {
        leadId,
        status,
        scheduledAt,
        assignedToId: assigneeId,
        internalNotes: notes || null,
      },
    });
    if (status === "SCHEDULED") {
      await tx.lead.update({
        where: { id: leadId },
        data: { status: "CONSULTATION_SCHEDULED" },
      });
    }
    await tx.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: "consultation_created",
        summary: scheduledAt
          ? `Consultation scheduled for ${scheduledAt.toLocaleString()}.`
          : "Consultation record created by administrator.",
      },
    });
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Consultation",
    entityId: leadId,
    meta: { leadId },
  });

  revalidatePath("/admin/consultations");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
}
