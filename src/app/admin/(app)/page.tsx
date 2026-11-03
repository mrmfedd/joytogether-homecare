import Link from "next/link";
import { getDashboardKpis } from "@/lib/admin/queries";
import { requireAdminSession } from "@/lib/auth";
import { canViewReports } from "@/lib/permissions";
import { redirect } from "next/navigation";

function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const body = (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="font-display mt-2 text-3xl text-[var(--midnight)]">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminDashboardPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login");

  let kpis;
  try {
    kpis = await getDashboardKpis();
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="font-display text-2xl">Database unavailable</h1>
        <p className="mt-2 text-sm">
          Configure preview `DATABASE_URL` on Neon and run migrations before using the admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Dashboard</h1>
      <p className="body-muted mt-2">Live CRM metrics from PostgreSQL (preview database).</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total inquiries" value={kpis.totalLeads} href="/admin/leads" />
        <StatCard label="New inquiries" value={kpis.newLeads} href="/admin/leads?status=NEW" />
        <StatCard label="Awaiting follow-up" value={kpis.awaitingFollowUp} href="/admin/leads" />
        <StatCard label="Scheduled consultations" value={kpis.scheduledConsultations} href="/admin/consultations" />
        <StatCard label="Private Duty inquiries" value={kpis.privateDutyLeads} href="/admin/private-duty" />
        <StatCard label="Skilled Nursing inquiries" value={kpis.skilledNursingLeads} />
        <StatCard label="Hospice inquiries" value={kpis.hospiceLeads} />
        <StatCard label="Transportation inquiries" value={kpis.transportationLeads} />
        <StatCard label="Job applications" value={kpis.jobApplications} href="/admin/careers" />
        <StatCard label="Lead conversion rate" value={`${kpis.conversionRate}%`} />
        <StatCard label="Failed notifications" value={kpis.notificationsFailed} href="/admin/settings" />
      </div>

      {canViewReports(user.role) ? (
        <section className="mt-10 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl text-[var(--midnight)]">Inquiries by source</h2>
          <ul className="mt-4 space-y-2">
            {kpis.bySource.map((row) => (
              <li key={row.source} className="flex justify-between text-sm font-semibold">
                <span>{row.source}</span>
                <span>{row._count._all}</span>
              </li>
            ))}
            {kpis.bySource.length === 0 ? (
              <li className="text-sm text-muted">No leads recorded yet.</li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
