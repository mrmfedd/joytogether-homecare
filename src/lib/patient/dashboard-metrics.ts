import { prisma } from "@/lib/prisma";

export async function getPatientCoordinationKpis() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    activePatients,
    activeAssignments,
    todaysVisits,
    notesAwaitingReview,
    unreadThreads,
    urgentAlerts,
    openAlerts,
  ] = await Promise.all([
    prisma.patient.count({ where: { status: { in: ["ACTIVE", "PENDING", "ON_HOLD"] } } }),
    prisma.patientAssignment.count({ where: { status: { in: ["ACTIVE", "PENDING"] } } }),
    prisma.patientVisit.count({
      where: { scheduledStart: { gte: todayStart, lt: todayEnd }, status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
    }),
    prisma.patientCareNote.count({ where: { status: "SUBMITTED", reviewedAt: null } }),
    prisma.message.count({
      where: {
        readBy: { none: {} },
        thread: { archivedAt: null, kind: { in: ["PATIENT", "STAFF"] } },
      },
    }),
    prisma.patientAlert.count({ where: { priority: "URGENT", status: { in: ["NEW", "ACKNOWLEDGED", "IN_PROGRESS"] } } }),
    prisma.patientAlert.count({ where: { status: { in: ["NEW", "ACKNOWLEDGED", "IN_PROGRESS"] } } }),
  ]);

  return {
    activePatients,
    activeAssignments,
    todaysVisits,
    notesAwaitingReview,
    unreadThreads,
    urgentAlerts,
    openAlerts,
  };
}