import { LeadStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const privateDutyMatchers = ["private duty", "private-duty", "private pay", "private-pay"];

function isPrivateDuty(service: string) {
  const s = service.toLowerCase();
  return privateDutyMatchers.some((m) => s.includes(m));
}

export async function getDashboardKpis() {
  const [
    totalLeads,
    newLeads,
    awaitingFollowUp,
    scheduledConsultations,
    privateDutyLeads,
    skilledNursingLeads,
    hospiceLeads,
    transportationLeads,
    jobApplications,
    convertedLeads,
    notificationsFailed,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({
      where: { status: { in: ["NEW", "CONTACTED"] } },
    }),
    prisma.consultation.count({ where: { status: "SCHEDULED" } }),
    prisma.lead.count({
      where: {
        OR: privateDutyMatchers.map((m) => ({
          serviceInterest: { contains: m, mode: "insensitive" as const },
        })),
      },
    }),
    prisma.lead.count({
      where: { serviceInterest: { contains: "skilled", mode: "insensitive" } },
    }),
    prisma.lead.count({
      where: { serviceInterest: { contains: "hospice", mode: "insensitive" } },
    }),
    prisma.lead.count({
      where: { serviceInterest: { contains: "transport", mode: "insensitive" } },
    }),
    prisma.jobApplication.count(),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
    prisma.notification.count({ where: { status: "FAILED" } }),
  ]);

  const conversionRate =
    totalLeads === 0 ? 0 : Math.round((convertedLeads / totalLeads) * 1000) / 10;

  const bySource = await prisma.lead.groupBy({
    by: ["source"],
    _count: { _all: true },
    orderBy: { _count: { source: "desc" } },
  });

  return {
    totalLeads,
    newLeads,
    awaitingFollowUp,
    scheduledConsultations,
    privateDutyLeads,
    skilledNursingLeads,
    hospiceLeads,
    transportationLeads,
    jobApplications,
    conversionRate,
    notificationsFailed,
    bySource,
    isPrivateDuty,
  };
}

export async function listLeads(filters?: {
  status?: LeadStatus;
  service?: string;
  q?: string;
  privateDutyOnly?: boolean;
}) {
  const where: Parameters<typeof prisma.lead.findMany>[0]["where"] = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.service) {
    where.serviceInterest = { contains: filters.service, mode: "insensitive" };
  }

  const privateDutyOr = privateDutyMatchers.map((m) => ({
    serviceInterest: { contains: m, mode: "insensitive" as const },
  }));

  if (filters?.q) {
    const qOr = [
      { fullName: { contains: filters.q, mode: "insensitive" as const } },
      { email: { contains: filters.q, mode: "insensitive" as const } },
      { phone: { contains: filters.q, mode: "insensitive" as const } },
    ];
    if (filters.privateDutyOnly) {
      where.AND = [{ OR: privateDutyOr }, { OR: qOr }];
    } else {
      where.OR = qOr;
    }
  } else if (filters?.privateDutyOnly) {
    where.OR = privateDutyOr;
  }

  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      consultations: { select: { id: true, status: true, scheduledAt: true }, take: 1 },
    },
  });
}
