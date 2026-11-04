"use server";

import { revalidatePath } from "next/cache";
import type { ConsultationStatus, LeadStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canManageLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  findConsultationScheduleConflicts,
  formatConsultationConflictMessage,
} from "@/lib/admin/consultation-scheduling";
import { redirect } from "next/navigation";
import { CONSENT_TEXT_VERSION } from "@/lib/validation/consultation";

export async function createManualLeadAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) return;

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const serviceInterest = String(formData.get("serviceInterest") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const source = String(formData.get("source") || "admin-manual").trim() || "admin-manual";
  const notes = String(formData.get("notes") || "").trim();

  if (!fullName || !email || !phone || !serviceInterest) return;

  const consentText = "Manual entry — administrator confirmed contact consent for nonclinical follow-up.";

  const lead = await prisma.$transaction(async (tx) => {
    const created = await tx.lead.create({
      data: {
        fullName,
        email,
        phone,
        serviceInterest,
        location: location || null,
        source,
        status: "NEW",
        consentAt: new Date(),
        consentTextVersion: CONSENT_TEXT_VERSION,
        nonClinicalNotes: notes || null,
        assignedToId: user.id,
      },
    });
    await tx.consentRecord.create({
      data: { leadId: created.id, text: consentText, version: CONSENT_TEXT_VERSION },
    });
    await tx.consultation.create({ data: { leadId: created.id, status: "REQUESTED" } });
    await tx.leadActivity.create({
      data: {
        leadId: created.id,
        userId: user.id,
        type: "created",
        summary: `Lead created manually by administrator. Service: ${serviceInterest}.`,
      },
    });
    return created;
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Lead",
    entityId: lead.id,
    meta: { source: "admin-manual" },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/private-duty");
  revalidatePath("/admin");
  revalidatePath("/admin/consultations");
}

export async function updateLeadStatusAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) {
    return;
  }

  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "") as LeadStatus;
  const note = String(formData.get("note") || "").trim();

  if (!leadId) return;

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
    if (note) {
      await tx.lead.update({
        where: { id: leadId },
        data: { nonClinicalNotes: note },
      });
    }
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
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
  return;
}

export async function assignLeadAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) {
    return;
  }

  const leadId = String(formData.get("leadId") || "");
  const assigneeId = String(formData.get("assigneeId") || "");
  if (!leadId || !assigneeId) return;

  const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { name: true, email: true } });

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
        summary: `Lead assigned to ${assignee?.name || assignee?.email || assigneeId}.`,
      },
    });
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  return;
}

export async function scheduleConsultationAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) return;

  const leadId = String(formData.get("leadId") || "");
  const consultationId = String(formData.get("consultationId") || "");
  const scheduledRaw = String(formData.get("scheduledAt") || "");
  const assigneeId = String(formData.get("assigneeId") || user.id);
  if (!leadId || !consultationId || !scheduledRaw) return;

  const scheduledAt = new Date(scheduledRaw);
  const conflicts = await findConsultationScheduleConflicts({
    assignedToId: assigneeId,
    scheduledAt,
    excludeConsultationId: consultationId,
  });
  const conflictMsg = formatConsultationConflictMessage(conflicts);
  if (conflictMsg) {
    redirect(`/admin/leads/${leadId}?error=${encodeURIComponent(conflictMsg)}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.consultation.update({
      where: { id: consultationId },
      data: {
        status: "SCHEDULED",
        scheduledAt,
        assignedToId: assigneeId,
      },
    });
    await tx.lead.update({
      where: { id: leadId },
      data: { status: "CONSULTATION_SCHEDULED" },
    });
    await tx.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: "consultation_scheduled",
        summary: `Consultation scheduled for ${scheduledAt.toLocaleString()}.`,
      },
    });
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/consultations");
  revalidatePath("/admin/consultations/calendar");
  return;
}

export async function updateLeadFieldsAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) return;

  const leadId = String(formData.get("leadId") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const serviceInterest = String(formData.get("serviceInterest") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const preferredContact = String(formData.get("preferredContact") || "").trim();
  const nonClinicalNotes = String(formData.get("nonClinicalNotes") || "").trim();
  if (!leadId || !fullName || !email || !phone || !serviceInterest) return;

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        fullName,
        email,
        phone,
        serviceInterest,
        location: location || null,
        preferredContact: preferredContact || null,
        nonClinicalNotes: nonClinicalNotes || null,
      },
    });
    await tx.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: "updated",
        summary: "Lead contact and inquiry fields updated by administrator.",
      },
    });
  });

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "Lead",
    entityId: leadId,
    meta: { fields: "contact,inquiry" },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin/private-duty");
}

export async function archiveLeadAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) return;

  const leadId = String(formData.get("leadId") || "");
  const confirm = String(formData.get("confirm") || "");
  if (!leadId || confirm !== "ARCHIVE") return;

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: { status: "CLOSED" },
    });
    await tx.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: "archived",
        summary: "Lead archived (closed) by administrator.",
      },
    });
  });

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "Lead",
    entityId: leadId,
    meta: { archived: true },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect("/admin/leads");
}

export async function createFollowUpTaskAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) return;

  const leadId = String(formData.get("leadId") || "");
  const title = String(formData.get("title") || "").trim();
  const dueRaw = String(formData.get("dueAt") || "");
  const assigneeId = String(formData.get("assigneeId") || user.id);
  const notes = String(formData.get("notes") || "").trim();
  if (!leadId || !title) return;

  await prisma.followUpTask.create({
    data: {
      leadId,
      title,
      dueAt: dueRaw ? new Date(dueRaw) : null,
      assignedToId: assigneeId,
      notes: notes || null,
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId,
      userId: user.id,
      type: "follow_up_task",
      summary: `Follow-up task created: ${title}`,
    },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  return;
}

export async function completeFollowUpTaskAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageLeads(user.role)) return;

  const taskId = String(formData.get("taskId") || "");
  const leadId = String(formData.get("leadId") || "");
  await prisma.followUpTask.update({
    where: { id: taskId },
    data: { status: "DONE" },
  });
  revalidatePath(`/admin/leads/${leadId}`);
  return;
}
