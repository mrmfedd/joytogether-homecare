import { prisma } from "@/lib/prisma";

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

export async function findConsultationScheduleConflicts(params: {
  assignedToId: string;
  scheduledAt: Date;
  excludeConsultationId?: string;
  durationMs?: number;
}) {
  const durationMs = params.durationMs ?? DEFAULT_DURATION_MS;
  const start = params.scheduledAt;
  const end = new Date(params.scheduledAt.getTime() + durationMs);

  return prisma.consultation.findMany({
    where: {
      id: params.excludeConsultationId ? { not: params.excludeConsultationId } : undefined,
      assignedToId: params.assignedToId,
      status: { in: ["SCHEDULED", "REQUESTED"] },
      scheduledAt: {
        not: null,
        lt: end,
        gt: new Date(start.getTime() - durationMs),
      },
    },
    include: { lead: { select: { fullName: true } } },
    take: 5,
  });
}

export function formatConsultationConflictMessage(
  conflicts: Awaited<ReturnType<typeof findConsultationScheduleConflicts>>,
) {
  if (conflicts.length === 0) return null;
  const names = conflicts.map((c) => c.lead.fullName).join(", ");
  return `Scheduling conflict: assignee already has consultation(s) overlapping this time (${names}).`;
}
