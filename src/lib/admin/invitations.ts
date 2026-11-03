import { createHash, randomBytes } from "crypto";
import type { UserRole } from "@/generated/prisma";
import { writeAuditLog } from "@/lib/audit";
import { hashInviteToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { site } from "@/content/site";

export type InviteValidation =
  | { ok: true; email: string; role: UserRole }
  | { ok: false; reason: "missing" | "invalid" | "expired" | "used" | "account_exists" };

async function sendInviteEmail(to: string, acceptUrl: string) {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim();
  if (!resendKey || !resendFrom) {
    throw new Error("RESEND_API_KEY and RESEND_FROM must be configured to send invitations.");
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
      subject: `${site.name} Admin invitation`,
      text: [
        `You have been invited to ${site.name} Admin.`,
        "",
        "Open this one-time link within 48 hours to set your password:",
        acceptUrl,
        "",
        "If you did not expect this email, ignore it.",
        "",
        "—",
        site.legalName,
        `Phone: ${site.contact.phone}`,
        `Email: ${site.contact.email}`,
        site.url,
      ].join("\n"),
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    throw new Error(json.message || `Resend HTTP ${res.status}`);
  }
  return json.id ?? "sent";
}

async function burnOutstandingInvites(email: string) {
  const outstanding = await prisma.adminInvitation.findMany({
    where: { email, acceptedAt: null },
  });
  for (const row of outstanding) {
    const burned = createHash("sha256")
      .update(`burned-${row.id}-${randomBytes(16).toString("hex")}`)
      .digest("hex");
    await prisma.adminInvitation.update({
      where: { id: row.id },
      data: { expiresAt: new Date(Date.now() - 60_000), tokenHash: burned },
    });
  }
  return outstanding.length;
}

export async function validateAdminInviteToken(token: string | undefined | null): Promise<InviteValidation> {
  if (!token?.trim()) return { ok: false, reason: "missing" };

  const invite = await prisma.adminInvitation.findUnique({
    where: { tokenHash: hashInviteToken(token.trim()) },
  });
  if (!invite) return { ok: false, reason: "invalid" };
  if (invite.acceptedAt) return { ok: false, reason: "used" };
  if (invite.expiresAt < new Date()) return { ok: false, reason: "expired" };

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) return { ok: false, reason: "account_exists" };

  return { ok: true, email: invite.email, role: invite.role };
}

export async function createAndEmailAdminInvitation(params: {
  email: string;
  role: UserRole;
  baseUrl: string;
  createdByUserId?: string;
}) {
  const email = params.email.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new Error("A valid email address is required.");
  }

  const base = params.baseUrl.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_SITE_URL is required.");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("An account already exists for this email.");
  }

  const burned = await burnOutstandingInvites(email);

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

  const invitation = await prisma.adminInvitation.create({
    data: {
      email,
      role: params.role,
      tokenHash,
      expiresAt,
      createdById: params.createdByUserId,
    },
  });

  const acceptUrl = `${base}/admin/accept-invite?token=${token}`;
  const messageId = await sendInviteEmail(email, acceptUrl);

  if (params.createdByUserId) {
    await writeAuditLog({
      userId: params.createdByUserId,
      action: "CREATE",
      entity: "AdminInvitation",
      entityId: invitation.id,
      meta: { email, role: params.role, priorInvitesBurned: burned, resendAccepted: Boolean(messageId) },
    });
  }

  return {
    invitationId: invitation.id,
    email,
    role: params.role,
    priorInvitesBurned: burned,
    resendMessageId: messageId,
  };
}
