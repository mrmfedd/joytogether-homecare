import type { ReportDateRange } from "./date-range";
import { formatReportPeriod } from "./date-range";
import {
  fetchConsultationReportMetrics,
  fetchEmployeeReportMetrics,
  fetchLeadReportMetrics,
  fetchPrivateDutyReportMetrics,
  fetchShiftReportMetrics,
  fetchTimeOffReportMetrics,
  fetchTimesheetReportMetrics,
} from "./metrics";

export type ReportExportPayload = {
  category: string;
  categoryLabel: string;
  periodLabel: string;
  generatedAt: string;
  filterSummary: string;
  rows: string[][];
};

export async function buildReportExportPayload(
  category: string,
  range: ReportDateRange,
): Promise<ReportExportPayload> {
  const periodLabel = formatReportPeriod(range);
  const generatedAt = new Date().toLocaleString();
  const filterSummary = `From ${range.from.toISOString().slice(0, 10)} to ${range.to.toISOString().slice(0, 10)}`;

  const labels: Record<string, string> = {
    leads: "Lead reports",
    consultations: "Consultation reports",
    "private-duty": "Private duty reports",
    employees: "Employee reports",
    shifts: "Shift reports",
    "time-off": "Time off reports",
    timesheets: "Timesheet reports",
  };

  let rows: string[][] = [["Metric", "Value"]];

  switch (category) {
    case "consultations": {
      const m = await fetchConsultationReportMetrics(range);
      rows = [
        ["Metric", "Value"],
        ["Total consultations", String(m.total)],
        ["Scheduled", String(m.scheduled)],
        ["Completed", String(m.completed)],
        ["Canceled", String(m.canceled)],
        ...m.byStatus.map((r) => [`Status: ${r.status}`, String(r.count)]),
        ...m.byMonth.map((r) => [`Month: ${r.month}`, String(r.count)]),
      ];
      break;
    }
    case "private-duty": {
      const m = await fetchPrivateDutyReportMetrics(range);
      rows = [
        ["Metric", "Value"],
        ["Inquiries (period)", String(m.inquiries)],
        ["Open leads (all time)", String(m.openLeads)],
        ["Converted (period)", String(m.converted)],
        ...m.byStatus.map((r) => [`Status: ${r.status}`, String(r.count)]),
      ];
      break;
    }
    case "employees": {
      const m = await fetchEmployeeReportMetrics();
      rows = [
        ["Metric", "Value"],
        ["Active employees", String(m.active)],
        ["Inactive employees", String(m.inactive)],
        ["Credentials expiring within 60 days", String(m.expiringCredentials)],
      ];
      break;
    }
    case "shifts": {
      const m = await fetchShiftReportMetrics(range);
      rows = [
        ["Metric", "Value"],
        ["Shift assignments", String(m.assigned)],
        ["Published shifts", String(m.published)],
        ["Open offers", String(m.openOffers)],
        ["Pending responses", String(m.pendingResponses)],
        ["Rejected responses", String(m.rejectedResponses)],
        ["Unfilled published shifts", String(m.unfilled)],
      ];
      break;
    }
    case "time-off": {
      const m = await fetchTimeOffReportMetrics(range);
      rows = [
        ["Metric", "Value"],
        ["Pending", String(m.pending)],
        ["Approved", String(m.approved)],
        ["Denied", String(m.denied)],
        ["Employees with requests (top 15)", String(m.requestsByProfile)],
      ];
      break;
    }
    case "timesheets": {
      const m = await fetchTimesheetReportMetrics(range);
      rows = [
        ["Metric", "Value"],
        ["Time entries", String(m.entries)],
        ["Open (missing clock-out)", String(m.openEntries)],
        ["Pending corrections", String(m.pendingCorrections)],
        ["Hours worked (closed entries)", String(m.totalHoursWorked)],
      ];
      break;
    }
    default: {
      const m = await fetchLeadReportMetrics(range);
      rows = [
        ["Metric", "Value"],
        ["Total leads (period)", String(m.total)],
        ["New leads (period)", String(m.newInPeriod)],
        ["Converted (period)", String(m.convertedInPeriod)],
        ["Conversion rate %", String(m.conversionRate)],
        ["Consultations created (period)", String(m.consultationsInPeriod)],
        ["All-time lead count", String(m.totalAllTime)],
        ...m.byStatus.map((r) => [`Status: ${r.status}`, String(r.count)]),
        ...m.byService.map((r) => [`Service: ${r.service}`, String(r.count)]),
        ...m.byMonth.map((r) => [`Month: ${r.month}`, String(r.count)]),
      ];
      category = "leads";
    }
  }

  return {
    category,
    categoryLabel: labels[category] || "Administrative report",
    periodLabel,
    generatedAt,
    filterSummary,
    rows,
  };
}

export const REPORT_CATEGORIES = [
  "leads",
  "consultations",
  "private-duty",
  "employees",
  "shifts",
  "time-off",
  "timesheets",
] as const;
