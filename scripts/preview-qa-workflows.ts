#!/usr/bin/env npx tsx
/** Preview-only transactional QA for leads, consultations, notices. Rolls back via cleanup labels. */
import "./load-local-env";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import {
  findConsultationScheduleConflicts,
  formatConsultationConflictMessage,
} from "../src/lib/admin/consultation-scheduling";
import { CONSENT_TEXT_VERSION } from "../src/lib/validation/consultation";

const MARK = `QA-PREVIEW-${Date.now()}`;

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!url?.includes("ep-summer-band")) throw new Error("Preview DB only");
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const admin = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) throw new Error("No admin user on Preview");

  const employee = await prisma.employeeProfile.findFirst({
    where: { employmentStatus: "ACTIVE" },
    include: { user: true },
  });

  const lead = await prisma.$transaction(async (tx) => {
    const created = await tx.lead.create({
      data: {
        fullName: `${MARK} Lead`,
        email: `${MARK}@example.com`.toLowerCase(),
        phone: "8135550199",
        serviceInterest: "Private Duty QA",
        source: "qa-preview-script",
        status: "NEW",
        consentAt: new Date(),
        consentTextVersion: CONSENT_TEXT_VERSION,
        assignedToId: admin.id,
      },
    });
    await tx.consentRecord.create({
      data: { leadId: created.id, text: "QA consent", version: CONSENT_TEXT_VERSION },
    });
    return created;
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { fullName: `${MARK} Lead Updated`, nonClinicalNotes: "QA edit ok" },
  });

  const slot = new Date(Date.now() + 7 * 86400000);
  slot.setMinutes(0, 0, 0);
  const c1 = await prisma.consultation.create({
    data: {
      leadId: lead.id,
      status: "SCHEDULED",
      scheduledAt: slot,
      assignedToId: admin.id,
    },
  });

  const conflicts = await findConsultationScheduleConflicts({
    assignedToId: admin.id,
    scheduledAt: slot,
    excludeConsultationId: undefined,
  });
  const conflictMsg = formatConsultationConflictMessage(conflicts);

  const notice = await prisma.staffNotice.create({
    data: {
      title: `${MARK} Notice`,
      body: "QA notice body — no PHI.",
      priority: "NORMAL",
      requiresAck: true,
      targetAll: true,
      createdById: admin.id,
    },
  });

  await prisma.staffNotice.update({
    where: { id: notice.id },
    data: { title: `${MARK} Notice Edited` },
  });

  if (employee) {
    await prisma.staffNotice.update({
      where: { id: notice.id },
      data: { publishedAt: new Date() },
    });
    await prisma.staffNoticeRecipient.create({
      data: { noticeId: notice.id, profileId: employee.id, readAt: new Date(), ackAt: new Date() },
    });
  }

  await prisma.staffNotice.update({
    where: { id: notice.id },
    data: { archivedAt: new Date() },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: "CLOSED" },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        mark: MARK,
        leadId: lead.id,
        leadEdit: true,
        consultationId: c1.id,
        conflictDetected: Boolean(conflictMsg),
        conflictMessage: conflictMsg,
        noticeId: notice.id,
        noticeDraftEditPublishAckArchive: Boolean(employee),
        employeeUsed: employee?.user.email ?? null,
        leadArchived: true,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
