import type { EmployeeClassification } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA;
}

export async function findShiftConflictsForProfile(
  profileId: string,
  startsAt: Date,
  endsAt: Date,
  excludeShiftId?: string,
) {
  return prisma.shiftAssignment.findMany({
    where: {
      profileId,
      shift: {
        id: excludeShiftId ? { not: excludeShiftId } : undefined,
        status: { in: ["DRAFT", "PUBLISHED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    },
    include: { shift: true },
  });
}

export async function findApprovedTimeOffOverlap(
  profileId: string,
  startsAt: Date,
  endsAt: Date,
) {
  return prisma.employeeTimeOffRequest.findFirst({
    where: {
      profileId,
      status: "APPROVED",
      startDate: { lte: endsAt },
      endDate: { gte: startsAt },
    },
  });
}

export function employeeMeetsOfferRequirements(
  classification: EmployeeClassification,
  credentials: { name: string; expiresAt: Date | null }[],
  requiredClassification: EmployeeClassification | null,
  requiredCredentialName: string | null,
) {
  if (requiredClassification && classification !== requiredClassification) {
    return false;
  }
  if (requiredCredentialName) {
    const now = new Date();
    const match = credentials.some(
      (c) =>
        c.name.toLowerCase() === requiredCredentialName.toLowerCase() &&
        (!c.expiresAt || c.expiresAt > now),
    );
    if (!match) return false;
  }
  return true;
}

/** Approve one open-shift response inside a transaction; prevents double-fill. */
export async function approveShiftResponseTransaction(responseId: string, reviewerId: string) {
  return prisma.$transaction(async (tx) => {
    const response = await tx.shiftResponse.findUnique({
      where: { id: responseId },
      include: {
        offer: { include: { shift: true } },
        profile: { include: { credentials: true } },
      },
    });
    if (!response || response.status !== "PENDING") {
      throw new Error("Response is not pending.");
    }
    const offer = response.offer;
    if (offer.status !== "OPEN") {
      throw new Error("Offer is no longer open.");
    }

    const conflicts = await tx.shiftAssignment.findMany({
      where: {
        profileId: response.profileId,
        shift: {
          status: { in: ["PUBLISHED", "DRAFT"] },
          startsAt: { lt: offer.shift.endsAt },
          endsAt: { gt: offer.shift.startsAt },
        },
      },
    });
    if (conflicts.length > 0) {
      throw new Error("Employee has a scheduling conflict.");
    }

    const timeOff = await tx.employeeTimeOffRequest.findFirst({
      where: {
        profileId: response.profileId,
        status: "APPROVED",
        startDate: { lte: offer.shift.endsAt },
        endDate: { gte: offer.shift.startsAt },
      },
    });
    if (timeOff) {
      throw new Error("Employee has approved time off during this shift.");
    }

    if (
      !employeeMeetsOfferRequirements(
        response.profile.classification,
        response.profile.credentials,
        offer.requiredClassification,
        offer.requiredCredentialName,
      )
    ) {
      throw new Error("Employee does not meet offer requirements.");
    }

    await tx.shiftResponse.update({
      where: { id: responseId },
      data: { status: "APPROVED", reviewerId },
    });

    await tx.shiftResponse.updateMany({
      where: { offerId: offer.id, id: { not: responseId }, status: "PENDING" },
      data: { status: "REJECTED", reviewerId },
    });

    await tx.shiftOffer.update({
      where: { id: offer.id },
      data: { status: "FILLED" },
    });

    await tx.shiftAssignment.upsert({
      where: { shiftId: offer.shiftId },
      create: {
        shiftId: offer.shiftId,
        profileId: response.profileId,
        confirmationStatus: "PENDING",
      },
      update: { profileId: response.profileId, confirmationStatus: "PENDING" },
    });

    await tx.shift.update({
      where: { id: offer.shiftId },
      data: { status: "PUBLISHED" },
    });

    return response;
  });
}

export async function claimOpenShiftTransaction(offerId: string, profileId: string) {
  return prisma.$transaction(async (tx) => {
    const offer = await tx.shiftOffer.findUnique({
      where: { id: offerId },
      include: { shift: true },
    });
    if (!offer || offer.status !== "OPEN") {
      throw new Error("Shift is no longer available.");
    }
    if (offer.expiresAt && offer.expiresAt < new Date()) {
      await tx.shiftOffer.update({ where: { id: offerId }, data: { status: "EXPIRED" } });
      throw new Error("Shift offer expired.");
    }

    const existing = await tx.shiftResponse.findUnique({
      where: { offerId_profileId: { offerId, profileId } },
    });
    if (existing) {
      return existing;
    }

    return tx.shiftResponse.create({
      data: { offerId, profileId, status: "PENDING" },
    });
  });
}
