import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canViewLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { ConsultationCalendar } from "./ConsultationCalendar";
import { ConsultationReschedulePanel } from "./ConsultationReschedulePanel";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

function parseMonth(param?: string) {
  if (param && /^\d{4}-\d{2}$/.test(param)) return param;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ConsultationCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; error?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");

  const params = await searchParams;
  const month = parseMonth(params.month);
  const [y, m] = month.split("-").map(Number);
  const rangeStart = new Date(y, m - 1, 1);
  const rangeEnd = new Date(y, m, 0, 23, 59, 59, 999);

  const [consultations, assignees] = await Promise.all([
    prisma.consultation.findMany({
      where: {
        scheduledAt: { gte: rangeStart, lte: rangeEnd },
      },
      include: {
        lead: { select: { id: true, fullName: true } },
        assignedTo: { select: { name: true, email: true, id: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"] }, active: true },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const calItems = consultations
    .filter((c) => c.scheduledAt)
    .map((c) => ({
      id: c.id,
      status: c.status,
      scheduledAt: c.scheduledAt!.toISOString(),
      leadName: c.lead.fullName,
      leadId: c.lead.id,
      assignee: c.assignedTo?.name || c.assignedTo?.email || "—",
    }));

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/consultations"
        title="Consultation calendar"
        description="Month view of scheduled consultations. Reschedule below with conflict checks."
      />

      <Link href="/admin/consultations" className="text-sm font-bold text-[var(--royal)] hover:underline">
        ← Consultations list
      </Link>

      {params.error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{decodeURIComponent(params.error)}</p>
      ) : null}

      <div className="mt-6">
        {calItems.length === 0 ? (
          <AdminEmptyState
            title="No scheduled consultations this month"
            description="Schedule consultations from the list view or from a lead record. Only consultations with a date and time appear on the calendar."
            actionLabel="Open list view"
            actionHref="/admin/consultations"
          />
        ) : (
          <ConsultationCalendar month={month} consultations={calItems} listHref="/admin/consultations" />
        )}
      </div>

      <ConsultationReschedulePanel consultations={consultations} assignees={assignees} />
    </div>
  );
}
