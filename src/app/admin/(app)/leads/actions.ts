"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canManageLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function updateLeadStatusAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) {
    return { ok: false, error: "Unauthorized" };
  }

  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "") as LeadStatus;
  const note = String(formData.get("note") || "").trim();

  if (!leadId) return { ok: false, error: "Missing lead" };

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: { status },
    });
    await tx.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: "status_change",
        summary: `Status updated to ${status}.${note ? ` Note: ${note}` : ""}`,
      },
    });
  });

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "Lead",
    entityId: leadId,
    meta: { status },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/private-duty");
  revalidatePath("/admin");
  return { ok: true };
}

export async function assignLeadAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) {
    return { ok: false, error: "Unauthorized" };
  }

  const leadId = String(formData.get("leadId") || "");
  const assigneeId = String(formData.get("assigneeId") || "");
  if (!leadId || !assigneeId) return { ok: false, error: "Missing fields" };

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: { assignedToId: assigneeId },
    });
    await tx.leadAssignment.create({
      data: { leadId, userId: assigneeId },
    });
    await tx.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: "assignment",
        summary: `Lead assigned to user ${assigneeId}.`,
      },
    });
  });

  revalidatePath("/admin/leads");
  return { ok: true };
}
