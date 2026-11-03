import Link from "next/link";
import { LeadStatus } from "@/generated/prisma";
import { createManualLeadAction } from "@/app/admin/(app)/leads/actions";
import { listLeads } from "@/lib/admin/queries";
import { requireAdminSession } from "@/lib/auth";
import { canManageLeads, canViewLeadContact, canViewLeads, canViewReports } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

const statuses = Object.values(LeadStatus);

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; service?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");

  const params = await searchParams;
  const status = statuses.includes(params.status as LeadStatus)
    ? (params.status as LeadStatus)
    : undefined;

  const leads = await listLeads({
    status,
    q: params.q,
    service: params.service,
  });

  const showContact = canViewLeadContact(user.role);
  const canEdit = canManageLeads(user.role);
  const hasFilters = Boolean(params.q || params.service || params.status);

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/leads"
        title="Leads"
        description="Marketing inquiries only — no clinical records."
      />

      {canEdit ? (
        <details className="mt-4 rounded-2xl border border-line bg-white p-5 print:hidden">
          <summary className="cursor-pointer text-sm font-bold text-[var(--royal)]">Create lead manually</summary>
          <form action={createManualLeadAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="fullName" required placeholder="Full name" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="email" type="email" required placeholder="Email" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="phone" required placeholder="Phone" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="serviceInterest" required placeholder="Service interest" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="location" placeholder="Location (optional)" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <input name="source" placeholder="Source (default: admin-manual)" className="rounded-xl border border-line px-3 py-2 text-sm" />
            <textarea name="notes" placeholder="Nonclinical notes" rows={2} className="sm:col-span-2 rounded-xl border border-line px-3 py-2 text-sm" />
            <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm sm:col-span-2">
              Create lead
            </button>
          </form>
        </details>
      ) : null}

      <form className="mb-6 mt-6 flex flex-wrap gap-2 print:hidden">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name, email, phone"
          className="rounded-xl border border-line px-3 py-2 text-sm"
        />
        <input
          name="service"
          defaultValue={params.service}
          placeholder="Service filter"
          className="rounded-xl border border-line px-3 py-2 text-sm"
        />
        <select name="status" defaultValue={params.status || ""} className="rounded-xl border border-line px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
          Filter
        </button>
        {canEdit ? (
          <a
            href="/api/admin/reports/export?category=leads"
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold"
          >
            Export summary CSV
          </a>
        ) : null}
        {canEdit && canViewReports(user.role) ? (
          <a href="/api/admin/leads/export" className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold">
            Export lead detail CSV
          </a>
        ) : null}
      </form>

      {leads.length === 0 ? (
        hasFilters ? (
          <p className="text-sm text-muted">No leads match this filter.</p>
        ) : (
          <AdminEmptyState
            title="No leads have been received yet"
            description="New website inquiries will appear here automatically. Expand “Create lead manually” above to add one."
          />
        )
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line/70">
                  <td className="px-4 py-3 whitespace-nowrap">{lead.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold">{lead.fullName}</td>
                  <td className="px-4 py-3">
                    {showContact ? (
                      <>
                        <div>{lead.email}</div>
                        <div className="text-muted">{lead.phone}</div>
                      </>
                    ) : (
                      <span className="text-muted">Restricted</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{lead.serviceInterest}</td>
                  <td className="px-4 py-3">{lead.status}</td>
                  <td className="px-4 py-3">{lead.assignedTo?.name || lead.assignedTo?.email || "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="font-bold text-[var(--royal)] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
