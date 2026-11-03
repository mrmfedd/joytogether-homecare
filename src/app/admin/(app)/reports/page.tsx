import { requireAdminSession } from "@/lib/auth";
import { canViewReports } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReportsCharts } from "./ReportsCharts";

export default async function AdminReportsPage() {
  const user = await requireAdminSession();
  if (!user || !canViewReports(user.role)) redirect("/admin");

  const byService = await prisma.lead.groupBy({
    by: ["serviceInterest"],
    _count: { _all: true },
    orderBy: { _count: { serviceInterest: "desc" } },
    take: 12,
  });

  const byMonth = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month, COUNT(*)::bigint as count
    FROM "Lead"
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 12
  `;

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Reports</h1>
      <p className="body-muted mt-1 text-sm">Live database analytics — no fabricated metrics.</p>
      <ReportsCharts
        byService={byService.map((r) => ({ name: r.serviceInterest, count: r._count._all }))}
        byMonth={byMonth.map((r) => ({ month: r.month, count: Number(r.count) }))}
      />
    </div>
  );
}
