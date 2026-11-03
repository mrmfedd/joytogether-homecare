import { prisma } from "@/lib/prisma";

export function formatShiftRange(startsAt: Date, endsAt: Date, timeZone = "America/New_York") {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const start = startsAt.toLocaleString("en-US", opts);
  const end = endsAt.toLocaleString("en-US", { ...opts, weekday: undefined, month: undefined, day: undefined });
  return `${start} – ${end}`;
}

export async function getEmployeeDashboardData(profileId: string) {
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    profile,
    upcomingAssignments,
    pendingConfirmations,
    openOffersCount,
    unreadNotices,
    pendingTimeOff,
    openTimeEntry,
    recentResponses,
  ] = await Promise.all([
    prisma.employeeProfile.findUnique({
      where: { id: profileId },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.shiftAssignment.findMany({
      where: {
        profileId,
        shift: { status: "PUBLISHED", startsAt: { gte: now, lte: weekAhead } },
      },
      include: { shift: true },
      orderBy: { shift: { startsAt: "asc" } },
      take: 5,
    }),
    prisma.shiftAssignment.count({
      where: { profileId, confirmationStatus: "PENDING", shift: { status: "PUBLISHED", startsAt: { gte: now } } },
    }),
    prisma.shiftOffer.count({
      where: {
        status: "OPEN",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        shift: { status: "PUBLISHED", startsAt: { gte: now } },
      },
    }),
    prisma.staffNoticeRecipient.count({
      where: { profileId, readAt: null, notice: { publishedAt: { not: null } } },
    }),
    prisma.employeeTimeOffRequest.count({ where: { profileId, status: "PENDING" } }),
    prisma.timeEntry.findFirst({
      where: { profileId, status: "OPEN" },
      orderBy: { clockInAt: "desc" },
    }),
    prisma.shiftResponse.findMany({
      where: { profileId },
      include: { offer: { include: { shift: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return {
    profile,
    upcomingAssignments,
    pendingConfirmations,
    openOffersCount,
    unreadNotices,
    pendingTimeOff,
    openTimeEntry,
    recentResponses,
  };
}

export async function getWorkforceReportKpis() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const [
    activeEmployees,
    shiftsThisWeek,
    publishedShifts,
    openOffers,
    pendingShiftResponses,
    pendingTimeOff,
    openTimeEntries,
    pendingCorrections,
    noticesPublished30d,
  ] = await Promise.all([
    prisma.employeeProfile.count({ where: { employmentStatus: "ACTIVE" } }),
    prisma.shift.count({
      where: { startsAt: { gte: weekStart, lt: weekEnd }, status: { not: "CANCELED" } },
    }),
    prisma.shift.count({ where: { status: "PUBLISHED", startsAt: { gte: now } } }),
    prisma.shiftOffer.count({ where: { status: "OPEN" } }),
    prisma.shiftResponse.count({ where: { status: "PENDING" } }),
    prisma.employeeTimeOffRequest.count({ where: { status: "PENDING" } }),
    prisma.timeEntry.count({ where: { status: "OPEN" } }),
    prisma.timesheetCorrection.count({ where: { status: "PENDING" } }),
    prisma.staffNotice.count({
      where: { publishedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    activeEmployees,
    shiftsThisWeek,
    publishedShifts,
    openOffers,
    pendingShiftResponses,
    pendingTimeOff,
    openTimeEntries,
    pendingCorrections,
    noticesPublished30d,
  };
}
