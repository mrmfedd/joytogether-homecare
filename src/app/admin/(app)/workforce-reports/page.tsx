import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canViewWorkforceReports } from "@/lib/workforce/permissions";
import { getWorkforceReportKpis } from "@/lib/workforce/queries";

function Stat({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="font-display mt-2 text-3xl text-[var(--midnight)]">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function WorkforceReportsPage() {
  const user = await requireAdminSession();
  if (!user || !canViewWorkforceReports(user.role)) redirect("/admin");

  let kpis;
  try {
    kpis = await getWorkforceReportKpis();
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="font-display text-2xl">Workforce data unavailable</h1>
        <p className="mt-2 text-sm">Ensure workforce migrations are applied on the preview database.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Workforce reports</h1>
      <p className="mt-2 text-sm text-muted">Scheduling and staffing KPIs from PostgreSQL.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Active employees" value={kpis.activeEmployees} href="/admin/employees" />
        <Stat label="Shifts this week" value={kpis.shiftsThisWeek} href="/admin/scheduling" />
        <Stat label="Upcoming published shifts" value={kpis.publishedShifts} href="/admin/scheduling" />
        <Stat label="Open shift offers" value={kpis.openOffers} href="/admin/open-shifts" />
        <Stat label="Pending shift responses" value={kpis.pendingShiftResponses} href="/admin/open-shifts" />
        <Stat label="Pending time off" value={kpis.pendingTimeOff} href="/admin/time-off" />
        <Stat label="Open time entries" value={kpis.openTimeEntries} href="/admin/timesheets" />
        <Stat label="Pending corrections" value={kpis.pendingCorrections} href="/admin/timesheets" />
        <Stat label="Notices (30 days)" value={kpis.noticesPublished30d} href="/admin/notices" />
      </div>
    </div>
  );
}
