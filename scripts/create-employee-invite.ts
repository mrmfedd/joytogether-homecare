#!/usr/bin/env npx tsx
/**
 * Create employee portal invitation (Resend email). Never prints token.
 * ADMIN_INVITE_EMAIL=staff@example.com EMPLOYEE_CLASSIFICATION=CNA npx tsx scripts/create-employee-invite.ts
 */
import "dotenv/config";
import { EmployeeClassification } from "../src/generated/prisma";
import { createAndEmailEmployeeInvitation } from "../src/lib/employee/invitations";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.EMPLOYEE_INVITE_EMAIL?.trim().toLowerCase();
  const classification = (process.env.EMPLOYEE_CLASSIFICATION || "CNA") as EmployeeClassification;
  if (!email) throw new Error("Set EMPLOYEE_INVITE_EMAIL");
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_SITE_URL required");

  const result = await createAndEmailEmployeeInvitation({ email, classification, baseUrl: base });
  console.log(`Employee invitation sent to ${result.email} (${result.classification}).`);
  console.log(`Prior outstanding invites invalidated: ${result.priorInvitesBurned}.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
