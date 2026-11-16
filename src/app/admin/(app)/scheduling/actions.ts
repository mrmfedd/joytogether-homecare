"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canManageScheduling } from "@/lib/workforce/permissions";
import { findApprovedTimeOffOverlap, findShiftConflictsForProfile } from "@/lib/workforce/shifts";
import { prisma } from "@/lib/prisma";
import { assertPatientAccess, PatientAccessDeniedError } from "@/lib/patient/access";
import { canViewPatientDirectory } from "@/lib/patient/permissions";
import { upsertPatientVisitForShift } from "@/lib/patient/visits";

export async function createShiftAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const title = String(formData.get("title") || "").trim() || null;
  const serviceCategory = String(formData.get("serviceCategory") || "").trim() || "General";
  const startsRaw = String(formData.get("startsAt") || "");
  const endsRaw = String(formData.get("endsAt") || "");
  const workLocationLabel = String(formData.get("workLocationLabel") || "").trim() || null;
  if (!startsRaw || !endsRaw) return;

  const startsAt = new Date(startsRaw);
  const endsAt = new Date(endsRaw);
  if (endsAt <= startsAt) return;

  const patientId = String(formData.get("patientId") || "").trim() || null;

  const shift = await prisma.shift.create({
    data: {
      title,
      serviceCategory,
      startsAt,
      endsAt,
      workLocationLabel,
      status: "DRAFT",
      createdById: user.id,
      patientId: patientId || undefined,
    },
  });

  if (patientId) {
    if (!canViewPatientDirectory(user.role)) return;
    try {
      await assertPatientAccess({ kind: "admin", userId: user.id, role: user.role }, patientId);
      await upsertPatientVisitForShift({
        patientId,
        shiftId: shift.id,
        actorUserId: user.id,
      });
    } catch (e) {
      if (e instanceof PatientAccessDeniedError) return;
      throw e;
    }
  }

  await writeAuditLog({ userId: user.id, action: "CREATE", entity: "Shift", entityId: shift.id });
  revalidatePath("/admin/scheduling");
}

export async function updateShiftAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const shiftId = String(formData.get("shiftId") || "");
  const title = String(formData.get("title") || "").trim() || null;
  const serviceCategory = String(formData.get("serviceCategory") || "").trim();
  const startsRaw = String(formData.get("startsAt") || "");
  const endsRaw = String(formData.get("endsAt") || "");
  const workLocationLabel = String(formData.get("workLocationLabel") || "").trim() || null;
  if (!shiftId || !startsRaw || !endsRaw) return;

  await prisma.shift.update({
    where: { id: shiftId },
    data: {
      title,
      serviceCategory: serviceCategory || undefined,
      startsAt: new Date(startsRaw),
      endsAt: new Date(endsRaw),
      workLocationLabel,
      version: { increment: 1 },
    },
  });

  revalidatePath("/admin/scheduling");
}

export async function publishShiftAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const shiftId = String(formData.get("shiftId") || "");
  if (!shiftId) return;

  await prisma.shift.update({
    where: { id: shiftId },
    data: { status: "PUBLISHED" },
  });

  await writeAuditLog({ userId: user.id, action: "PUBLISH", entity: "Shift", entityId: shiftId });
  revalidatePath("/admin/scheduling");
}

export async function cancelShiftAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const shiftId = String(formData.get("shiftId") || "");
  if (!shiftId) return;

  await prisma.shift.update({
    where: { id: shiftId },
    data: { status: "CANCELED" },
  });

  revalidatePath("/admin/scheduling");
}

export async function assignEmployeeToShiftAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const shiftId = String(formData.get("shiftId") || "");
  const profileId = String(formData.get("profileId") || "");
  if (!shiftId || !profileId) return;

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift || shift.status === "CANCELED") return;

  const conflicts = await findShiftConflictsForProfile(profileId, shift.startsAt, shift.endsAt, shiftId);
  if (conflicts.length > 0) return;

  const timeOff = await findApprovedTimeOffOverlap(profileId, shift.startsAt, shift.endsAt);
  if (timeOff) return;

  await prisma.shiftAssignment.upsert({
    where: { shiftId },
    create: { shiftId, profileId, confirmationStatus: "PENDING" },
    update: { profileId, confirmationStatus: "PENDING", confirmedAt: null, declinedAt: null },
  });

  if (shift.patientId && canViewPatientDirectory(user.role)) {
    try {
      await assertPatientAccess({ kind: "admin", userId: user.id, role: user.role }, shift.patientId);
      await upsertPatientVisitForShift({
        patientId: shift.patientId,
        shiftId,
        primaryProfileId: profileId,
        actorUserId: user.id,
      });
    } catch (e) {
      if (e instanceof PatientAccessDeniedError) return;
      throw e;
    }
  }

  revalidatePath("/admin/scheduling");
}

export async function moveShiftWeekAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) return;

  const shiftId = String(formData.get("shiftId") || "");
  const targetWeekStartRaw = String(formData.get("targetWeekStart") || "");
  if (!shiftId || !targetWeekStartRaw) return;

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift) return;

  const targetWeekStart = new Date(targetWeekStartRaw);
  const duration = shift.endsAt.getTime() - shift.startsAt.getTime();
  const dayOffset = shift.startsAt.getDay();
  const newStart = new Date(targetWeekStart);
  newStart.setDate(targetWeekStart.getDate() + dayOffset);
  newStart.setHours(shift.startsAt.getHours(), shift.startsAt.getMinutes(), 0, 0);
  const newEnd = new Date(newStart.getTime() + duration);

  const assignment = await prisma.shiftAssignment.findUnique({ where: { shiftId } });
  if (assignment) {
    const conflicts = await findShiftConflictsForProfile(assignment.profileId, newStart, newEnd, shiftId);
    if (conflicts.length > 0) return;
  }

  await prisma.shift.update({
    where: { id: shiftId },
    data: { startsAt: newStart, endsAt: newEnd, version: { increment: 1 } },
  });

  revalidatePath("/admin/scheduling");
}
