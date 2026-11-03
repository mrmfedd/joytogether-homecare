import Link from "next/link";
import { LeadStatus } from "@/generated/prisma";
import { listLeads } from "@/lib/admin/queries";
import { requireAdminSession } from "@/lib/auth";
import { canViewLeadContact, canViewLeads } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";

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

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/leads"
        title="Leads"
        description="Marketing inquiries only — no clinical records."
      />
      <form className="mb-6 flex flex-wrap gap-2">
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
        </form>

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
                <td className="px-4 py-3 whitespace-nowrap">
                  {lead.createdAt.toLocaleDateString()}
                </td>
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
        {leads.length === 0 ? <p className="p-6 text-sm text-muted">No leads match this filter.</p> : null}
      </div>
    </div>
  );
}
