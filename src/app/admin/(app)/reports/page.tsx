import { Suspense } from "react";
import { requireAdminSession } from "@/lib/auth";
import { canViewReports } from "@/lib/permissions";
import { parseReportDateRange, formatReportPeriod } from "@/lib/admin/reporting/date-range";
import {
  fetchConsultationReportMetrics,
  fetchEmployeeReportMetrics,
  fetchLeadReportMetrics,
  fetchPrivateDutyReportMetrics,
  fetchShiftReportMetrics,
  fetchTimeOffReportMetrics,
  fetchTimesheetReportMetrics,
} from "@/lib/admin/reporting/metrics";
import { redirect } from "next/navigation";
import { ReportCategoryNav, ReportExportBar, ReportMetricGrid } from "./ReportDashboard";
import { site } from "@/content/site";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; from?: string; to?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewReports(user.role)) redirect("/admin");

  const params = await searchParams;
  const category = params.category || "leads";
  const range = parseReportDateRange(params);
  const periodLabel = formatReportPeriod(range);
  const generatedAt = new Date().toLocaleString();

  let metrics: { label: string; value: string | number }[] = [];

  switch (category) {
    case "consultations": {
      const m = await fetchConsultationReportMetrics(range);
      metrics = [
        { label: "Total consultations", value: m.total },
        { label: "Scheduled", value: m.scheduled },
        { label: "Completed", value: m.completed },
        { label: "Canceled", value: m.canceled },
        ...m.byStatus.map((r) => ({ label: `Status: ${r.status}`, value: r.count })),
      ];
      break;
    }
    case "private-duty": {
      const m = await fetchPrivateDutyReportMetrics(range);
      metrics = [
        { label: "Private duty inquiries (period)", value: m.inquiries },
        { label: "Open private duty leads", value: m.openLeads },
        { label: "Converted (period)", value: m.converted },
        ...m.byStatus.map((r) => ({ label: `Status: ${r.status}`, value: r.count })),
      ];
      break;
    }
    case "employees": {
      const m = await fetchEmployeeReportMetrics();
      metrics = [
        { label: "Active employees", value: m.active },
        { label: "Inactive employees", value: m.inactive },
        { label: "Credentials expiring (60 days)", value: m.expiringCredentials },
      ];
      break;
    }
    case "shifts": {
      const m = await fetchShiftReportMetrics(range);
      metrics = [
        { label: "Shift assignments", value: m.assigned },
        { label: "Published shifts", value: m.published },
        { label: "Open offers", value: m.openOffers },
        { label: "Pending responses", value: m.pendingResponses },
        { label: "Rejected responses", value: m.rejectedResponses },
        { label: "Unfilled published shifts", value: m.unfilled },
      ];
      break;
    }
    case "time-off": {
      const m = await fetchTimeOffReportMetrics(range);
      metrics = [
        { label: "Pending", value: m.pending },
        { label: "Approved", value: m.approved },
        { label: "Denied", value: m.denied },
        { label: "Employees with requests", value: m.requestsByProfile },
      ];
      break;
    }
    case "timesheets": {
      const m = await fetchTimesheetReportMetrics(range);
      metrics = [
        { label: "Time entries", value: m.entries },
        { label: "Open (missing clock-out)", value: m.openEntries },
        { label: "Pending corrections", value: m.pendingCorrections },
        { label: "Hours worked (closed entries)", value: m.totalHoursWorked },
      ];
      break;
    }
    default: {
      const m = await fetchLeadReportMetrics(range);
      metrics = [
        { label: "Total leads (period)", value: m.total },
        { label: "New leads", value: m.newInPeriod },
        { label: "Converted", value: m.convertedInPeriod },
        { label: "Conversion rate %", value: m.conversionRate },
        { label: "Consultations created (period)", value: m.consultationsInPeriod },
        { label: "All-time lead count", value: m.totalAllTime },
        ...m.byStatus.map((r) => ({ label: `Status: ${r.status}`, value: r.count })),
      ];
    }
  }

  return (
    <div className="report-print-root">
      <header className="report-print-header mb-6 border-b border-line pb-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{site.legalName}</p>
        <h1 className="font-display text-3xl text-[var(--midnight)]">Administrative reports</h1>
        <p className="mt-1 text-sm text-muted">
          Period: {periodLabel} · Generated {generatedAt}
        </p>
      </header>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 print:hidden">
        <label className="text-sm font-semibold">
          From
          <input
            type="date"
            name="from"
            defaultValue={params.from || range.from.toISOString().slice(0, 10)}
            className="ml-2 rounded-xl border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold">
          To
          <input
            type="date"
            name="to"
            defaultValue={params.to || range.to.toISOString().slice(0, 10)}
            className="ml-2 rounded-xl border border-line px-3 py-2 text-sm"
          />
        </label>
        <input type="hidden" name="category" value={category} />
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
          Apply range
        </button>
      </form>

      <Suspense fallback={null}>
        <ReportCategoryNav active={category} />
      </Suspense>

      <section className="mt-8">
        <h2 className="font-display text-xl capitalize text-[var(--midnight)]">{category.replace("-", " ")}</h2>
        <div className="mt-4">
          <ReportMetricGrid items={metrics} />
        </div>
        <ReportExportBar category={category} from={params.from || ""} to={params.to || ""} />
      </section>

      <footer className="report-print-footer mt-12 hidden text-xs text-muted print:block">
        {site.legalName} · Confidential operations report · Page generated {generatedAt}
      </footer>
    </div>
  );
}
