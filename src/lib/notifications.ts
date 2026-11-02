import { site } from "@/content/site";
import { prisma } from "@/lib/prisma";
import type { NotificationStatus, Prisma } from "@/generated/prisma";

type LeadEmailPayload = {
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  careType: string;
  source: string;
  location?: string;
};

const MAX_ATTEMPTS = 5;

export async function sendLeadEmail(payload: LeadEmailPayload): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendKey || !resendFrom) {
    return { ok: false, error: "RESEND not configured" };
  }

  const text = [
    "New JoyTogether lead (nonclinical marketing inquiry)",
    `Lead ID: ${payload.leadId}`,
    `Name: ${payload.fullName}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Care interest: ${payload.careType}`,
    `Source: ${payload.source}`,
    `Location: ${payload.location || "n/a"}`,
    "",
    "Review in admin: /admin/leads",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [site.contact.email],
        reply_to: payload.email,
        subject: `New lead — ${payload.careType}`,
        text,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: json.message || `Resend HTTP ${res.status}` };
    }
    return { ok: true, messageId: json.id };
  } catch {
    return { ok: false, error: "Resend request failed" };
  }
}

export async function deliverLeadNotification(notificationId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.type !== "lead_created") {
    return { ok: false, error: "Not found" };
  }
  if (notification.status === "SENT") {
    return { ok: true, skipped: true as const };
  }

  const payload = notification.payload as LeadEmailPayload;
  const result = await sendLeadEmail(payload);
  const attempts = notification.attempts + 1;
  let status: NotificationStatus = "PENDING";
  if (result.ok) status = "SENT";
  else if (attempts >= MAX_ATTEMPTS) status = "FAILED";

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      attempts,
      status,
      lastError: result.error,
      sentAt: result.ok ? new Date() : notification.sentAt,
      payload: {
        ...payload,
        resendMessageId: result.messageId,
      } as Prisma.InputJsonValue,
    },
  });

  return { ok: result.ok, status, error: result.error };
}

export async function queueLeadNotification(payload: LeadEmailPayload) {
  const notification = await prisma.notification.create({
    data: {
      type: "lead_created",
      payload: payload as Prisma.InputJsonValue,
      leadId: payload.leadId,
      status: "PENDING",
    },
  });

  const result = await deliverLeadNotification(notification.id);
  return { notificationId: notification.id, ...result };
}

export async function processNotificationRetries(limit = 20) {
  const pending = await prisma.notification.findMany({
    where: {
      OR: [{ status: "PENDING" }, { status: "FAILED", attempts: { lt: MAX_ATTEMPTS } }],
      attempts: { lt: MAX_ATTEMPTS },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let processed = 0;
  for (const n of pending) {
    if (n.type === "lead_created") {
      await deliverLeadNotification(n.id);
      processed += 1;
    }
  }
  return processed;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendKey || !resendFrom) {
    return { ok: false, error: "RESEND not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [to],
      subject: "JoyTogether admin password reset",
      text: `Use this link once within 1 hour to reset your password:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    }),
  });

  return { ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
}
