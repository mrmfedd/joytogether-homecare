import { NextResponse } from "next/server";
import { LeadStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { canViewLeadContact, canViewLeads, canViewReports } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { parseReportDateRange } from "@/lib/admin/reporting/date-range";
import { maskEmail, maskPhone } from "@/lib/permissions";

export const runtime = "nodejs";

function csvEscape(value: string | number) {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role) || !canViewReports(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = parseReportDateRange({
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
  });
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam && Object.values(LeadStatus).includes(statusParam as LeadStatus)
      ? (statusParam as LeadStatus)
      : undefined;

  const showContact = canViewLeadContact(user.role);

  const leads = await prisma.lead.findMany({
    where: {
      createdAt: { gte: range.from, lte: range.to },
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      assignedTo: { select: { name: true, email: true } },
    },
  });

  const headers = showContact
    ? ["Created", "Name", "Email", "Phone", "Service", "Status", "Source", "Assigned"]
    : ["Created", "Name", "Email", "Phone", "Service", "Status", "Source", "Assigned"];

  const rows = leads.map((l) => [
    l.createdAt.toISOString(),
    l.fullName,
    showContact ? l.email : maskEmail(l.email),
    showContact ? l.phone : maskPhone(l.phone),
    l.serviceInterest,
    l.status,
    l.source,
    l.assignedTo?.name || l.assignedTo?.email || "",
  ]);

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="joytogether-leads-detail.csv"`,
    },
  });
}
