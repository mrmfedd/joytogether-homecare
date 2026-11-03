import { createHash, randomBytes } from "crypto";
import type { EmployeeClassification } from "@/generated/prisma";
import { writeAuditLog } from "@/lib/audit";
import { hashInviteToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { site } from "@/content/site";

export type EmployeeInviteValidation =
  | { ok: true; email: string; classification: EmployeeClassification }
  | { ok: false; reason: "missing" | "invalid" | "expired" | "used" | "account_exists" };

async function sendEmployeeInviteEmail(to: string, acceptUrl: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendKey || !resendFrom) {
    throw new Error("RESEND_API_KEY and RESEND_FROM must be configured.");
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
      subject: `${site.name} Employee Portal invitation`,
      text: [
        `You have been invited to the ${site.name} Employee Portal.`,
        "",
        "Use this one-time link within 48 hours to activate your account:",
        acceptUrl,
        "",
        "Scheduling notices will appear in the portal. Patient details are never sent by email.",
        "",
        site.legalName,
      ].join("\n"),
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) throw new Error(json.message || `Resend HTTP ${res.status}`);
  return json.id ?? "sent";
}

async function burnOutstandingInvites(email: string) {
  const outstanding = await prisma.employeeInvitation.findMany({
    where: { email, acceptedAt: null },
  });
  for (const row of outstanding) {
    const burned = createHash("sha256")
      .update(`burned-${row.id}-${randomBytes(16).toString("hex")}`)
      .digest("hex");
    await prisma.employeeInvitation.update({
      where: { id: row.id },
      data: { expiresAt: new Date(Date.now() - 60_000), tokenHash: burned },
    });
  }
  return outstanding.length;
}

export async function validateEmployeeInviteToken(
  token: string | undefined | null,
): Promise<EmployeeInviteValidation> {
  if (!token?.trim()) return { ok: false, reason: "missing" };
  const invite = await prisma.employeeInvitation.findUnique({
    where: { tokenHash: hashInviteToken(token.trim()) },
  });
  if (!invite) return { ok: false, reason: "invalid" };
  if (invite.acceptedAt) return { ok: false, reason: "used" };
  if (invite.expiresAt < new Date()) return { ok: false, reason: "expired" };
  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) return { ok: false, reason: "account_exists" };
  return { ok: true, email: invite.email, classification: invite.classification };
}

export async function createAndEmailEmployeeInvitation(params: {
  email: string;
  classification: EmployeeClassification;
  baseUrl: string;
  createdByUserId?: string;
}) {
  const email = params.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Valid email required.");
  const base = params.baseUrl.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_SITE_URL required.");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("An account already exists for this email.");

  const burned = await burnOutstandingInvites(email);
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

  const invitation = await prisma.employeeInvitation.create({
    data: {
      email,
      classification: params.classification,
      tokenHash: hashInviteToken(token),
      expiresAt,
      createdById: params.createdByUserId,
    },
  });

  const acceptUrl = `${base}/employee/accept-invite?token=${token}`;
  await sendEmployeeInviteEmail(email, acceptUrl);

  if (params.createdByUserId) {
    await writeAuditLog({
      userId: params.createdByUserId,
      action: "CREATE",
      entity: "EmployeeInvitation",
      entityId: invitation.id,
      meta: { email, classification: params.classification, priorInvitesBurned: burned },
    });
  }

  return { invitationId: invitation.id, email, classification: params.classification, priorInvitesBurned: burned };
}
