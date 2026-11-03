#!/usr/bin/env npx tsx
/**
 * Create a one-time admin invitation against preview/dev DB and email the accept link.
 * Never prints the raw token.
 *
 * Usage:
 *   ADMIN_INVITE_EMAIL=you@example.com npx tsx scripts/create-admin-invite.ts
 */
import "./load-local-env";
import { UserRole } from "../src/generated/prisma";
import { createAndEmailAdminInvitation } from "../src/lib/admin/invitations";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_INVITE_EMAIL?.trim().toLowerCase();
  const role = (process.env.ADMIN_INVITE_ROLE || "SUPER_ADMIN") as UserRole;
  if (!email) throw new Error("Set ADMIN_INVITE_EMAIL");

  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_SITE_URL required");

  const result = await createAndEmailAdminInvitation({ email, role, baseUrl: base });

  console.log(
    JSON.stringify(
      {
        ok: true,
        email: result.email,
        role: result.role,
        invitationIdPrefix: result.invitationId.slice(0, 8),
        priorInvitesBurned: result.priorInvitesBurned,
        resendMessageId: result.resendMessageId ?? null,
        resendAccepted: Boolean(result.resendMessageId),
        portalBaseUrl: base,
        acceptPath: "/admin/accept-invite",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
