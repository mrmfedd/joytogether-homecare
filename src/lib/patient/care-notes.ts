import type { CareNoteCategory } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { assertPatientAccess, PatientAccessDeniedError } from "@/lib/patient/access";
import { writePatientAuditEvent } from "@/lib/patient/audit";
import { encryptPhi, decryptPhi } from "@/lib/patient/phi-crypto";

export async function createCareNoteDraft(input: {
  patientId: string;
  profileId: string;
  userId: string;
  visitDate: Date;
  visitTimeMinutes?: number;
  category: CareNoteCategory;
  careActivities?: string;
  observations?: string;
  concerns?: string;
  actionsTaken?: string;
  additionalComments?: string;
  followUpRequired: boolean;
}) {
  await assertPatientAccess({ kind: "employee", userId: input.userId, profileId: input.profileId, role: "EMPLOYEE" }, input.patientId);

  const note = await prisma.patientCareNote.create({
    data: {
      patientId: input.patientId,
      profileId: input.profileId,
      visitDate: input.visitDate,
      visitTimeMinutes: input.visitTimeMinutes,
      category: input.category,
      careActivities: encryptPhi(input.careActivities),
      observations: encryptPhi(input.observations),
      concerns: encryptPhi(input.concerns),
      actionsTaken: encryptPhi(input.actionsTaken),
      additionalComments: encryptPhi(input.additionalComments),
      followUpRequired: input.followUpRequired,
      status: "DRAFT",
    },
  });

  await writePatientAuditEvent({
    patientId: input.patientId,
    userId: input.userId,
    action: "NOTE_DRAFT_CREATE",
    entityType: "PatientCareNote",
    entityId: note.id,
  });

  return note;
}

export async function submitCareNote(noteId: string, profileId: string, userId: string) {
  const note = await prisma.patientCareNote.findUnique({ where: { id: noteId } });
  if (!note || note.profileId !== profileId) throw new PatientAccessDeniedError("Note not found");
  if (note.status === "SUBMITTED") throw new Error("Note already submitted");

  await assertPatientAccess({ kind: "employee", userId, profileId, role: "EMPLOYEE" }, note.patientId);

  const updated = await prisma.patientCareNote.update({
    where: { id: noteId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  await writePatientAuditEvent({
    patientId: note.patientId,
    userId,
    action: "NOTE_SUBMIT",
    entityType: "PatientCareNote",
    entityId: noteId,
  });

  return updated;
}

export async function addCareNoteAddendum(input: {
  noteId: string;
  authorUserId: string;
  body: string;
}) {
  const note = await prisma.patientCareNote.findUnique({ where: { id: input.noteId } });
  if (!note || note.status !== "SUBMITTED") throw new Error("Submitted note required for addendum");

  const addendum = await prisma.patientCareNoteAddendum.create({
    data: {
      noteId: input.noteId,
      authorUserId: input.authorUserId,
      body: encryptPhi(input.body) ?? input.body,
    },
  });

  await writePatientAuditEvent({
    patientId: note.patientId,
    userId: input.authorUserId,
    action: "NOTE_ADDENDUM",
    entityType: "PatientCareNoteAddendum",
    entityId: addendum.id,
    meta: { noteId: input.noteId },
  });

  return addendum;
}

export function decryptCareNoteFields<T extends {
  careActivities: string | null;
  observations: string | null;
  concerns: string | null;
  actionsTaken: string | null;
  additionalComments: string | null;
}>(note: T) {
  return {
    ...note,
    careActivities: decryptPhi(note.careActivities),
    observations: decryptPhi(note.observations),
    concerns: decryptPhi(note.concerns),
    actionsTaken: decryptPhi(note.actionsTaken),
    additionalComments: decryptPhi(note.additionalComments),
  };
}

export async function markCareNoteReviewed(noteId: string, reviewerUserId: string, reviewNote?: string) {
  const note = await prisma.patientCareNote.update({
    where: { id: noteId },
    data: { reviewedAt: new Date(), reviewerUserId, reviewNote },
  });
  await writePatientAuditEvent({
    patientId: note.patientId,
    userId: reviewerUserId,
    action: "NOTE_REVIEW",
    entityType: "PatientCareNote",
    entityId: noteId,
  });
  return note;
}