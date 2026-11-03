import Link from "next/link";
import { createManualLeadAction } from "@/app/admin/(app)/leads/actions";
import { listLeads } from "@/lib/admin/queries";
import { requireAdminSession } from "@/lib/auth";
import { canManageLeads, canViewLeads } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";

export default async function PrivateDutyAdminPage() {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");
  const canEdit = canManageLeads(user.role);

  const leads = await listLeads({ privateDutyOnly: true });

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/private-duty"
        title="Private Duty Leads"
        description="Private-pay inquiries from the shared leads database — not a separate CRM."
      />

      {canEdit ? (
        <details className="mt-4 rounded-2xl border border-line bg-white p-5 print:hidden">
          <summary className="cursor-pointer text-sm font-bold text-[var(--royal)]">Add private duty lead</summary>
          <form action={createManualLeadAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="fullName" required placeholder="Full name" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="email" type="email" required placeholder="Email" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="phone" required placeholder="Phone" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input
              name="serviceInterest"
              required
              defaultValue="Private Duty"
              placeholder="Service interest"
              className="rounded-xl border border-line px-3 py-2 text-sm"
            />
            <input name="location" placeholder="Location" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="source" defaultValue="admin-private-duty" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <textarea name="notes" placeholder="Notes" rows={2} className="sm:col-span-2 rounded-xl border border-line px-3 py-2 text-sm" />
            <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm sm:col-span-2">
              Create lead
            </button>
          </form>
        </details>
      ) : null}

      <form className="mt-6 flex flex-wrap gap-2 print:hidden">
        <a
          href="/api/admin/reports/export?category=private-duty"
          className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold"
        >
          Export summary CSV
        </a>
      </form>

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
            <p className="mt-1 text-xs text-muted">
              {lead.createdAt.toLocaleDateString()} · Source: {lead.source}
            </p>
          </Link>
        ))}
        {leads.length === 0 ? (
          <AdminEmptyState
            title="No private duty inquiries yet"
            description="Inquiries whose service includes Private Duty or private pay appear here automatically. You can also add one manually."
            actionLabel={canEdit ? "Add lead on Leads page" : undefined}
            actionHref={canEdit ? "/admin/leads" : undefined}
          />
        ) : null}
      </div>
    </div>
  );
}
