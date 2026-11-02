import { site } from "@/content/site";
import { prisma } from "@/lib/prisma";
import type { NotificationStatus } from "@/generated/prisma";

type LeadEmailPayload = {
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  careType: string;
  source: string;
  location?: string;
};

export async function queueLeadNotification(payload: LeadEmailPayload) {
  const notification = await prisma.notification.create({
    data: {
      type: "lead_created",
      payload,
      leadId: payload.leadId,
      status: "PENDING",
    },
  });

  const result = await sendLeadEmail(payload);
  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: result.ok ? "SENT" : "FAILED",
      attempts: 1,
      lastError: result.error,
      sentAt: result.ok ? new Date() : null,
    },
  });

  return { notificationId: notification.id, ...result };
}

async function sendLeadEmail(payload: LeadEmailPayload): Promise<{ ok: boolean; error?: string }> {
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
    if (!res.ok) {
      return { ok: false, error: `Resend HTTP ${res.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Resend request failed" };
  }
}

export async function retryPendingNotifications(limit = 20) {
  const pending = await prisma.notification.findMany({
    where: { status: "PENDING", attempts: { lt: 5 } },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  for (const n of pending) {
    if (n.type !== "lead_created") continue;
    const payload = n.payload as LeadEmailPayload;
    const result = await sendLeadEmail(payload);
    await prisma.notification.update({
      where: { id: n.id },
      data: {
        attempts: { increment: 1 },
        status: (result.ok ? "SENT" : n.attempts >= 4 ? "FAILED" : "PENDING") as NotificationStatus,
        lastError: result.error,
        sentAt: result.ok ? new Date() : undefined,
      },
    });
  }
}
