import Link from "next/link";
import { listLeads } from "@/lib/admin/queries";
import { requireAdminSession } from "@/lib/auth";
import { canViewLeads } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function PrivateDutyAdminPage() {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");

  const leads = await listLeads({ privateDutyOnly: true });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Private Duty Leads</h1>
      <p className="body-muted mt-1 text-sm">
        Filtered view of private-pay inquiries from the shared leads database.
      </p>
      <div className="mt-6 space-y-3">
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/admin/leads/${lead.id}`}
            className="block rounded-2xl border border-line bg-white p-5 shadow-sm hover:border-[var(--joy-green)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{lead.fullName}</p>
              <span className="text-xs font-bold uppercase text-[var(--royal)]">{lead.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{lead.serviceInterest}</p>
            <p className="mt-1 text-xs text-muted">Source: {lead.source}</p>
          </Link>
        ))}
        {leads.length === 0 ? <p className="text-sm text-muted">No private duty leads yet.</p> : null}
      </div>
    </div>
  );
}
