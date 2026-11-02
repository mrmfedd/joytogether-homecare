"use server";

import { revalidatePath } from "next/cache";
import type { EmployeeClassification, NoticePriority } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canManageNotices } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { site } from "@/content/site";

async function queueStaffNotificationEmail(params: { noticeId: string; email: string; subject: string; body: string }) {
  const notification = await prisma.staffNotification.create({
    data: {
      noticeId: params.noticeId,
      email: params.email,
      subject: params.subject,
      status: "PENDING",
    },
  });

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendKey || !resendFrom) {
    await prisma.staffNotification.update({
      where: { id: notification.id },
      data: { status: "FAILED", lastError: "RESEND not configured", attempts: 1 },
    });
    return;
  }

  const text = [
    params.subject,
    "",
    params.body,
    "",
    `Sign in to the ${site.name} employee portal to read and acknowledge workplace notices.`,
    "This message contains no patient information.",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [params.email],
      subject: params.subject,
      text,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) {
    await prisma.staffNotification.update({
      where: { id: notification.id },
      data: { status: "FAILED", lastError: json.message || `HTTP ${res.status}`, attempts: 1 },
    });
    return;
  }

  await prisma.staffNotification.update({
    where: { id: notification.id },
    data: { status: "SENT", sentAt: new Date(), attempts: 1 },
  });
}

export async function createStaffNoticeAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageNotices(user.role)) return;

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const priority = (String(formData.get("priority") || "NORMAL") as NoticePriority) || "NORMAL";
  const requiresAck = formData.get("requiresAck") === "on";
  const targetAll = formData.has("targetAll") ? formData.get("targetAll") === "on" : true;
  const targetClassification = String(formData.get("targetClassification") || "") as EmployeeClassification | "";
  const targetDepartment = String(formData.get("targetDepartment") || "").trim() || null;
  if (!title || !body) return;

  await prisma.staffNotice.create({
    data: {
      title,
      body,
      priority,
      requiresAck,
      targetAll,
      targetClassification: targetClassification || null,
      targetDepartment,
      createdById: user.id,
    },
  });

  revalidatePath("/admin/notices");
}

export async function publishStaffNoticeAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageNotices(user.role)) return;

  const noticeId = String(formData.get("noticeId") || "");
  if (!noticeId) return;

  const notice = await prisma.staffNotice.findUnique({ where: { id: noticeId } });
  if (!notice || notice.publishedAt) return;

  const profiles = await prisma.employeeProfile.findMany({
    where: {
      employmentStatus: "ACTIVE",
      ...(notice.targetAll
        ? {}
        : {
            AND: [
              notice.targetClassification ? { classification: notice.targetClassification } : {},
              notice.targetDepartment ? { department: notice.targetDepartment } : {},
            ],
          }),
    },
    include: { user: { select: { email: true, active: true } } },
  });

  await prisma.staffNotice.update({
    where: { id: noticeId },
    data: { publishedAt: new Date() },
  });

  for (const profile of profiles) {
    if (!profile.user.active) continue;
    await prisma.staffNoticeRecipient.upsert({
      where: { noticeId_profileId: { noticeId, profileId: profile.id } },
      create: { noticeId, profileId: profile.id },
      update: {},
    });
    await queueStaffNotificationEmail({
      noticeId,
      email: profile.user.email,
      subject: `[${site.name}] Staff notice: ${notice.title}`,
      body: notice.body.slice(0, 500),
    });
  }

  await writeAuditLog({ userId: user.id, action: "PUBLISH", entity: "StaffNotice", entityId: noticeId });
  revalidatePath("/admin/notices");
}
