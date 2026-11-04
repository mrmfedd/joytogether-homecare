import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { canViewReports } from "@/lib/permissions";
import { parseReportDateRange } from "@/lib/admin/reporting/date-range";
import { buildReportExportPayload, REPORT_CATEGORIES } from "@/lib/admin/reporting/build-export-payload";
import { renderReportXlsx } from "@/lib/admin/reporting/render-xlsx";
import { renderReportPdf } from "@/lib/admin/reporting/render-pdf";

export const runtime = "nodejs";

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
  const categoryParam = url.searchParams.get("category") || "leads";
  const category = (REPORT_CATEGORIES as readonly string[]).includes(categoryParam) ? categoryParam : "leads";
  const format = (url.searchParams.get("format") || "csv").toLowerCase();
  const range = parseReportDateRange({
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
  });

  const payload = await buildReportExportPayload(category, range);
  const baseName = `joytogether-${category}-report`;

  if (format === "xlsx" || format === "excel") {
    const buffer = await renderReportXlsx(payload);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await renderReportPdf(payload);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
      },
    });
  }

  const csv = toCsv(payload.rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${baseName}.csv"`,
    },
  });
}
