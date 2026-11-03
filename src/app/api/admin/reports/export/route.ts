import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { canViewReports } from "@/lib/permissions";
import { parseReportDateRange } from "@/lib/admin/reporting/date-range";
import {
  fetchConsultationReportMetrics,
  fetchEmployeeReportMetrics,
  fetchLeadReportMetrics,
  fetchPrivateDutyReportMetrics,
  fetchShiftReportMetrics,
  fetchTimeOffReportMetrics,
  fetchTimesheetReportMetrics,
} from "@/lib/admin/reporting/metrics";

function csvEscape(value: string | number) {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export async function GET(req: Request) {
  const user = await requireAdminSession();
  if (!user || !canViewReports(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category") || "leads";
  const range = parseReportDateRange({
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
  });

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
        ...m.byStatus.map((r) => [`Status ${r.status}`, String(r.count)]),
        ...m.byMonth.map((r) => [`Month ${r.month}`, String(r.count)]),
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
        ...m.byStatus.map((r) => [`Status ${r.status}`, String(r.count)]),
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
        ...m.byStatus.map((r) => [`Status ${r.status}`, String(r.count)]),
        ...m.byService.map((r) => [`Service ${r.service}`, String(r.count)]),
        ...m.byMonth.map((r) => [`Month ${r.month}`, String(r.count)]),
      ];
    }
  }

  const csv = toCsv(rows);
  const filename = `joytogether-${category}-report.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
