import type { ReportDateRange } from "./date-range";
import { prisma } from "@/lib/prisma";
import { LeadStatus, ConsultationStatus } from "@/generated/prisma";

const privateDutyMatchers = ["private duty", "private-duty", "private pay", "private-pay"];

export async function fetchLeadReportMetrics(range: ReportDateRange) {
  const createdWhere = { createdAt: { gte: range.from, lte: range.to } };
  const [total, byStatus, byService, newInPeriod, convertedInPeriod, totalAllTime] = await Promise.all([
    prisma.lead.count({ where: createdWhere }),
    prisma.lead.groupBy({ by: ["status"], where: createdWhere, _count: { _all: true } }),
    prisma.lead.groupBy({
      by: ["serviceInterest"],
      where: createdWhere,
      _count: { _all: true },
      orderBy: { _count: { serviceInterest: "desc" } },
      take: 20,
    }),
    prisma.lead.count({ where: { ...createdWhere, status: "NEW" } }),
    prisma.lead.count({ where: { ...createdWhere, status: "CONVERTED" } }),
    prisma.lead.count(),
  ]);

  const byMonth = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month, COUNT(*)::bigint as count
    FROM "Lead"
    WHERE "createdAt" >= ${range.from} AND "createdAt" <= ${range.to}
    GROUP BY 1 ORDER BY 1 ASC
  `;

  const consultationsInPeriod = await prisma.consultation.count({
    where: { createdAt: { gte: range.from, lte: range.to } },
  });
  const conversionRate =
    total === 0 ? 0 : Math.round((convertedInPeriod / total) * 1000) / 10;

  return {
    total,
    totalAllTime,
    newInPeriod,
    convertedInPeriod,
    conversionRate,
    consultationsInPeriod,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
    byService: byService.map((r) => ({ service: r.serviceInterest, count: r._count._all })),
    byMonth: byMonth.map((r) => ({ month: r.month, count: Number(r.count) })),
  };
}

export async function fetchConsultationReportMetrics(range: ReportDateRange) {
  const where = { createdAt: { gte: range.from, lte: range.to } };
  const [total, byStatus, scheduled, completed, canceled] = await Promise.all([
    prisma.consultation.count({ where }),
    prisma.consultation.groupBy({ by: ["status"], where, _count: { _all: true } }),
    prisma.consultation.count({ where: { ...where, status: ConsultationStatus.SCHEDULED } }),
    prisma.consultation.count({ where: { ...where, status: ConsultationStatus.COMPLETED } }),
    prisma.consultation.count({ where: { ...where, status: ConsultationStatus.CANCELED } }),
  ]);

  const byMonth = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month, COUNT(*)::bigint as count
    FROM "Consultation"
    WHERE "createdAt" >= ${range.from} AND "createdAt" <= ${range.to}
    GROUP BY 1 ORDER BY 1 ASC
  `;

  return {
    total,
    scheduled,
    completed,
    canceled,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
    byMonth: byMonth.map((r) => ({ month: r.month, count: Number(r.count) })),
  };
}

export async function fetchPrivateDutyReportMetrics(range: ReportDateRange) {
  const pdOr = privateDutyMatchers.map((m) => ({
    serviceInterest: { contains: m, mode: "insensitive" as const },
  }));
  const createdWhere = {
    createdAt: { gte: range.from, lte: range.to },
    OR: pdOr,
  };

  const [inquiries, openLeads, converted] = await Promise.all([
    prisma.lead.count({ where: createdWhere }),
    prisma.lead.count({
      where: {
        OR: pdOr,
        status: { notIn: [LeadStatus.CONVERTED, LeadStatus.CLOSED] },
      },
    }),
    prisma.lead.count({ where: { ...createdWhere, status: LeadStatus.CONVERTED } }),
  ]);

  const byStatus = await prisma.lead.groupBy({
    by: ["status"],
    where: { OR: pdOr },
    _count: { _all: true },
  });

  return {
    inquiries,
    openLeads,
    converted,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
  };
}

export async function fetchEmployeeReportMetrics() {
  const [active, inactive, expiringCredentials] = await Promise.all([
    prisma.employeeProfile.count({ where: { user: { active: true } } }),
    prisma.employeeProfile.count({ where: { user: { active: false } } }),
    prisma.employeeCredential.count({
      where: {
        expiresAt: {
          lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
          not: null,
        },
      },
    }),
  ]);
  return { active, inactive, expiringCredentials };
}

export async function fetchShiftReportMetrics(range: ReportDateRange) {
  const shiftWhere = { startsAt: { gte: range.from, lte: range.to } };
  const [assigned, published, openOffers, pendingResponses, rejectedResponses] = await Promise.all([
    prisma.shiftAssignment.count({ where: { shift: shiftWhere } }),
    prisma.shift.count({ where: { ...shiftWhere, status: "PUBLISHED" } }),
    prisma.shiftOffer.count({ where: { status: "OPEN", shift: shiftWhere } }),
    prisma.shiftResponse.count({ where: { status: "PENDING", offer: { shift: shiftWhere } } }),
    prisma.shiftResponse.count({ where: { status: "REJECTED", offer: { shift: shiftWhere } } }),
  ]);
  const unfilled = await prisma.shift.count({
    where: {
      ...shiftWhere,
      status: "PUBLISHED",
      assignment: { is: null },
    },
  });
  return { assigned, published, openOffers, pendingResponses, rejectedResponses, unfilled };
}

export async function fetchTimeOffReportMetrics(range: ReportDateRange) {
  const where = { createdAt: { gte: range.from, lte: range.to } };
  const [pending, approved, denied, byEmployee] = await Promise.all([
    prisma.employeeTimeOffRequest.count({ where: { ...where, status: "PENDING" } }),
    prisma.employeeTimeOffRequest.count({ where: { ...where, status: "APPROVED" } }),
    prisma.employeeTimeOffRequest.count({ where: { ...where, status: "DENIED" } }),
    prisma.employeeTimeOffRequest.groupBy({
      by: ["profileId"],
      where,
      _count: { _all: true },
      orderBy: { _count: { profileId: "desc" } },
      take: 15,
    }),
  ]);
  return { pending, approved, denied, requestsByProfile: byEmployee.length };
}

export async function fetchTimesheetReportMetrics(range: ReportDateRange) {
  const where = { clockInAt: { gte: range.from, lte: range.to } };
  const [entries, openEntries, pendingCorrections, closedEntries] = await Promise.all([
    prisma.timeEntry.count({ where }),
    prisma.timeEntry.count({ where: { ...where, status: "OPEN" } }),
    prisma.timesheetCorrection.count({ where: { status: "PENDING" } }),
    prisma.timeEntry.findMany({
      where: { ...where, status: "CLOSED", clockOutAt: { not: null } },
      select: { clockInAt: true, clockOutAt: true },
    }),
  ]);

  let totalHours = 0;
  for (const e of closedEntries) {
    if (e.clockOutAt) {
      totalHours += (e.clockOutAt.getTime() - e.clockInAt.getTime()) / (1000 * 60 * 60);
    }
  }

  return {
    entries,
    openEntries,
    pendingCorrections,
    totalHoursWorked: Math.round(totalHours * 10) / 10,
  };
}
