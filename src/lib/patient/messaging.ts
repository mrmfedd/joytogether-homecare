import { prisma } from "@/lib/prisma";
import { assertPatientAccess, PatientAccessDeniedError } from "@/lib/patient/access";
import { writePatientAuditEvent } from "@/lib/patient/audit";
import { encryptPhi, decryptPhi } from "@/lib/patient/phi-crypto";
import type { MessageThreadKind, MessageUrgency, UserRole } from "@/generated/prisma";

export async function ensureThreadParticipant(threadId: string, userId: string) {
  const participant = await prisma.messageThreadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId } },
  });
  if (!participant || participant.leftAt) {
    throw new PatientAccessDeniedError("Thread access denied");
  }
}

export async function listThreadsForUser(userId: string, filters?: { unreadOnly?: boolean; patientId?: string; urgentOnly?: boolean }) {
  const threads = await prisma.messageThread.findMany({
    where: {
      archivedAt: null,
      patientId: filters?.patientId,
      urgency: filters?.urgentOnly ? "URGENT" : undefined,
      participants: { some: { userId, leftAt: null } },
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, publicId: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { readBy: { where: { userId } } } },
      participants: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return threads.filter((t) => {
    if (!filters?.unreadOnly) return true;
    const last = t.messages[0];
    if (!last) return false;
    return last.senderUserId !== userId && last.readBy.length === 0;
  });
}

export async function createPatientThread(input: {
  patientId: string;
  subject: string;
  createdByUserId: string;
  participantUserIds: string[];
  initialBody: string;
  urgency?: MessageUrgency;
  actorRole: UserRole;
  profileId?: string;
}) {
  if (input.actorRole === "EMPLOYEE") {
    if (!input.profileId) throw new PatientAccessDeniedError();
    await assertPatientAccess(
      { kind: "employee", userId: input.createdByUserId, profileId: input.profileId, role: "EMPLOYEE" },
      input.patientId,
    );
  }

  const thread = await prisma.$transaction(async (tx) => {
    const row = await tx.messageThread.create({
      data: {
        kind: "PATIENT",
        subject: input.subject,
        patientId: input.patientId,
        urgency: input.urgency ?? "NORMAL",
        createdByUserId: input.createdByUserId,
      },
    });

    const uniqueParticipants = new Set([input.createdByUserId, ...input.participantUserIds]);
    for (const userId of uniqueParticipants) {
      await tx.messageThreadParticipant.create({ data: { threadId: row.id, userId } });
    }

    await tx.message.create({
      data: {
        threadId: row.id,
        senderUserId: input.createdByUserId,
        body: encryptPhi(input.initialBody) ?? input.initialBody,
        urgency: input.urgency ?? "NORMAL",
      },
    });

    return row;
  });

  await writePatientAuditEvent({
    patientId: input.patientId,
    userId: input.createdByUserId,
    action: "MESSAGE_THREAD_CREATE",
    entityType: "MessageThread",
    entityId: thread.id,
  });

  return thread;
}

export async function postMessage(input: {
  threadId: string;
  senderUserId: string;
  body: string;
  urgency?: MessageUrgency;
}) {
  await ensureThreadParticipant(input.threadId, input.senderUserId);
  const message = await prisma.message.create({
    data: {
      threadId: input.threadId,
      senderUserId: input.senderUserId,
      body: encryptPhi(input.body) ?? input.body,
      urgency: input.urgency ?? "NORMAL",
    },
  });

  await prisma.messageThread.update({
    where: { id: input.threadId },
    data: { updatedAt: new Date(), officeAckAt: input.urgency === "URGENT" ? undefined : undefined },
  });

  return message;
}

export async function markMessageRead(messageId: string, userId: string) {
  await prisma.messageReadReceipt.upsert({
    where: { messageId_userId: { messageId, userId } },
    create: { messageId, userId },
    update: { readAt: new Date() },
  });
}

export async function acknowledgeUrgentThread(threadId: string, officeUserId: string) {
  await ensureThreadParticipant(threadId, officeUserId);
  return prisma.messageThread.update({
    where: { id: threadId },
    data: { officeAckAt: new Date() },
  });
}

export function decryptMessageBody(body: string) {
  return decryptPhi(body) ?? body;
}