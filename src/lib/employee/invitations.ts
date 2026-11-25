import { createHash, randomBytes } from "crypto";
import type { EmployeeClassification } from "@/generated/prisma";
import { writeAuditLog } from "@/lib/audit";
import { hashInviteToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { site } from "@/content/site";
import { publicSiteBaseUrl } from "@/lib/site-url";
import { buildEmployeeActivationUrl, isPendingEmployeeActivation } from "@/lib/employee/activation";

export { buildEmployeeActivationUrl, isPendingEmployeeActivation } from "@/lib/employee/activation";

export type EmployeeInviteValidation =
  | { ok: true; email: string; classification: EmployeeClassification; pendingProfile?: boolean }
  | { ok: false; reason: "missing" | "invalid" | "expired" | "used" | "account_exists" };

async function sendEmployeeInviteEmail(to: string, acceptUrl: string) {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim();
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
  const existing = await prisma.user.findUnique({
    where: { email: invite.email },
    include: { employeeProfile: true },
  });
  if (existing && !isPendingEmployeeActivation(existing)) {
    return { ok: false, reason: "account_exists" };
  }
  return {
    ok: true,
    email: invite.email,
    classification: invite.classification,
    pendingProfile: Boolean(existing),
  };
}

const EMPLOYEE_ACTIVATION_HOURS = 48 * 7;

export async function createEmployeeActivationWithoutEmail(params: {
  email: string;
  name: string;
  classification: EmployeeClassification;
  phone?: string;
  department?: string;
  baseUrl: string;
  createdByUserId: string;
}) {
  const email = params.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Valid email required.");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("An account already exists for this email.");
  }

  const burned = await burnOutstandingInvites(email);
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * EMPLOYEE_ACTIVATION_HOURS);
  const base = publicSiteBaseUrl(params.baseUrl);

  const { profile, invitation } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: params.name.trim(),
        role: "EMPLOYEE",
        active: false,
      },
    });

    const profile = await tx.employeeProfile.create({
      data: {
        userId: user.id,
        classification: params.classification,
        employmentStatus: "INVITED",
        ...(params.phone ? { phone: params.phone } : {}),
        ...(params.department ? { department: params.department } : {}),
      },
    });

    const invitation = await tx.employeeInvitation.create({
      data: {
        email,
        classification: params.classification,
        tokenHash: hashInviteToken(token),
        expiresAt,
        createdById: params.createdByUserId,
      },
    });

    return { profile, invitation };
  });

  const activationUrl = buildEmployeeActivationUrl(base, token);

  await writeAuditLog({
    userId: params.createdByUserId,
    action: "CREATE",
    entity: "EmployeeProfile",
    entityId: profile.id,
    meta: {
      via: "manual_admin_activation",
      email,
      classification: params.classification,
      priorInvitesBurned: burned,
      invitationId: invitation.id,
    },
  });

  return {
    profileId: profile.id,
    invitationId: invitation.id,
    email,
    activationUrl,
    expiresAt,
    priorInvitesBurned: burned,
  };
}

export async function regenerateEmployeeActivationLink(params: {
  profileId: string;
  baseUrl: string;
  createdByUserId: string;
}) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: params.profileId },
    include: { user: true },
  });
  if (!profile) throw new Error("Employee not found.");

  if (
    !isPendingEmployeeActivation({
      passwordHash: profile.user.passwordHash,
      active: profile.user.active,
      employeeProfile: { employmentStatus: profile.employmentStatus },
    })
  ) {
    throw new Error("This employee is not awaiting activation.");
  }

  const email = profile.user.email;
  const burned = await burnOutstandingInvites(email);
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * EMPLOYEE_ACTIVATION_HOURS);
  const base = publicSiteBaseUrl(params.baseUrl);

  const invitation = await prisma.employeeInvitation.create({
    data: {
      email,
      classification: profile.classification,
      tokenHash: hashInviteToken(token),
      expiresAt,
      createdById: params.createdByUserId,
    },
  });

  const activationUrl = buildEmployeeActivationUrl(base, token);

  await writeAuditLog({
    userId: params.createdByUserId,
    action: "UPDATE",
    entity: "EmployeeProfile",
    entityId: profile.id,
    meta: {
      via: "regenerate_activation_link",
      email,
      invitationId: invitation.id,
      priorInvitesBurned: burned,
    },
  });

  return { profileId: profile.id, email, activationUrl, expiresAt };
}

export async function createAndEmailEmployeeInvitation(params: {
  email: string;
  classification: EmployeeClassification;
  baseUrl: string;
  createdByUserId?: string;
}) {
  const email = params.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Valid email required.");
  const base = publicSiteBaseUrl(params.baseUrl);

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


/** Send a new password-setup link to an existing, still-unactivated employee.
 * This action is ONLY called by authorized administrator server actions.
 * It does not email active employees, reset passwords, or expose raw tokens in logs.
 */
export async function emailPendingEmployeeActivation(params: {
  profileId: string;
  baseUrl: string;
  createdByUserId: string;
}) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: params.profileId },
    include: { user: true },
  });
  if (
    !profile ||
    !isPendingEmployeeActivation({
      passwordHash: profile.user.passwordHash,
      active: profile.user.active,
      employeeProfile: { employmentStatus: profile.employmentStatus },
    }) ||
    profile.user.role !== "EMPLOYEE"
  ) {
    throw new Error("Caregiver is no longer awaiting activation.");
  }

  // Durable cooldown across serverless instances, using existing audit records.
  const recent = await prisma.auditLog.findMany({
    where: {
      entity: "EmployeeProfile",
      entityId: profile.id,
      action: "UPDATE",
      createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
    },
    select: { meta: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });
  if (recent.some((entry) =>
    entry.meta && typeof entry.meta === "object" &&
    !Array.isArray(entry.meta) &&
    "via" in entry.meta && entry.meta.via === "email_activation"
  )) {
    throw new Error("Activation email was requested recently. Try again in five minutes.");
  }

  // Keep the previous activation link usable if Resend rejects the email.
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const invitation = await prisma.employeeInvitation.create({
    data: {
      email: profile.user.email,
      classification: profile.classification,
      tokenHash: hashInviteToken(token),
      expiresAt,
      createdById: params.createdByUserId,
    },
  });

  try {
    await sendEmployeeInviteEmail(
      profile.user.email,
      buildEmployeeActivationUrl(publicSiteBaseUrl(params.baseUrl), token),
    );
  } catch {
    await prisma.employeeInvitation.delete({ where: { id: invitation.id } }).catch(() => undefined);
    throw new Error("Email provider did not accept the activation email. No previous link was invalidated.");
  }

  // After Resend accepts the message, invalidate older unused links.
  const prior = await prisma.employeeInvitation.findMany({
    where: { email: profile.user.email, acceptedAt: null, id: { not: invitation.id } },
    select: { id: true },
  });
  for (const row of prior) {
    await prisma.employeeInvitation.update({
      where: { id: row.id },
      data: {
        expiresAt: new Date(Date.now() - 60_000),
        tokenHash: createHash("sha256")
          .update(`burned-${row.id}-${randomBytes(16).toString("hex")}`)
          .digest("hex"),
      },
    });
  }

  await writeAuditLog({
    userId: params.createdByUserId,
    action: "UPDATE",
    entity: "EmployeeProfile",
    entityId: profile.id,
    meta: {
      via: "email_activation",
      invitationId: invitation.id,
      recipient: profile.user.email,
      providerAccepted: true,
      previousLinksInvalidated: prior.length,
    },
  });

  return { profileId: profile.id, email: profile.user.email, expiresAt };
}
