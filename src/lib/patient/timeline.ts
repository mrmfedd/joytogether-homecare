import { prisma } from "@/lib/prisma";

export type TimelineEntry = {
  id: string;
  at: Date;
  kind:
    | "assignment"
    | "visit"
    | "note"
    | "alert"
    | "audit"
    | "instruction";
  title: string;
  summary?: string;
};

export async function buildPatientTimeline(patientId: string, limit = 40): Promise<TimelineEntry[]> {
  const [assignments, visits, notes, alerts, audits, instructions] = await Promise.all([
    prisma.patientAssignment.findMany({
      where: { patientId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { caregiver: { include: { user: { select: { name: true } } } } },
    }),
    prisma.patientVisit.findMany({
      where: { patientId },
      orderBy: { scheduledStart: "desc" },
      take: limit,
    }),
    prisma.patientCareNote.findMany({
      where: { patientId, status: "SUBMITTED" },
      orderBy: { submittedAt: "desc" },
      take: limit,
      include: { author: { include: { user: { select: { name: true } } } } },
    }),
    prisma.patientAlert.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.patientAuditEvent.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.patientCareInstruction.findMany({
      where: { patientId },
      orderBy: { effectiveAt: "desc" },
      take: limit,
    }),
  ]);

  const entries: TimelineEntry[] = [
    ...assignments.map((a) => ({
      id: `assignment-${a.id}`,
      at: a.updatedAt,
      kind: "assignment" as const,
      title: `Caregiver assignment ${a.status.toLowerCase()}`,
      summary: a.caregiver.user.name ?? "Caregiver",
    })),
    ...visits.map((v) => ({
      id: `visit-${v.id}`,
      at: v.scheduledStart,
      kind: "visit" as const,
      title: `Visit ${v.status.toLowerCase().replace("_", " ")}`,
      summary: v.scheduledStart.toLocaleString(),
    })),
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      at: n.submittedAt ?? n.createdAt,
      kind: "note" as const,
      title: `Care note submitted`,
      summary: n.author.user.name ?? undefined,
    })),
    ...alerts.map((a) => ({
      id: `alert-${a.id}`,
      at: a.createdAt,
      kind: "alert" as const,
      title: a.title,
      summary: `${a.priority} · ${a.status}`,
    })),
    ...instructions.map((i) => ({
      id: `instruction-${i.id}`,
      at: i.effectiveAt,
      kind: "instruction" as const,
      title: i.supersededAt ? "Care instructions superseded" : "Care instructions updated",
    })),
    ...audits.map((e) => ({
      id: `audit-${e.id}`,
      at: e.createdAt,
      kind: "audit" as const,
      title: e.action,
      summary: e.entityType,
    })),
  ];

  return entries.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}