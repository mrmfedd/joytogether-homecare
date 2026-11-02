import { notFound, redirect } from "next/navigation";
import { updateLeadStatusAction } from "@/app/admin/(app)/leads/actions";
import { requireAdminSession } from "@/lib/auth";
import { canManageLeads, canViewLeadContact, canViewLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true, email: true } } } },
      consultations: true,
      assignedTo: true,
    },
  });
  if (!lead) notFound();

  const showContact = canViewLeadContact(user.role);
  const canEdit = canManageLeads(user.role);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--midnight)]">{lead.fullName}</h1>
      <p className="text-sm text-muted">Lead ID: {lead.id}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold">Contact</h2>
          {showContact ? (
            <ul className="mt-3 space-y-1 text-sm">
              <li>{lead.email}</li>
              <li>{lead.phone}</li>
              <li>{lead.location || "Location not provided"}</li>
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Contact details restricted for your role.</p>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold">Inquiry</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Service: {lead.serviceInterest}</li>
            <li>Source: {lead.source}</li>
            <li>Status: {lead.status}</li>
            <li>Preferred contact: {lead.preferredContact || "—"}</li>
          </ul>
        </div>
      </div>

      {canEdit ? (
        <form action={updateLeadStatusAction} className="mt-6 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold">Update status</h2>
          <input type="hidden" name="leadId" value={lead.id} />
          <div className="mt-3 flex flex-wrap gap-3">
            <select name="status" defaultValue={lead.status} className="rounded-xl border border-line px-3 py-2 text-sm">
              {Object.values(LeadStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              name="note"
              placeholder="Nonclinical follow-up note"
              className="min-w-[220px] flex-1 rounded-xl border border-line px-3 py-2 text-sm"
            />
            <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
              Save
            </button>
          </div>
        </form>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-xl">Activity</h2>
        <ul className="mt-4 space-y-3">
          {lead.activities.map((a) => (
            <li key={a.id} className="rounded-xl border border-line bg-white p-4 text-sm">
              <p>{a.summary}</p>
              <p className="mt-1 text-xs text-muted">
                {a.createdAt.toLocaleString()} {a.user?.email ? `• ${a.user.email}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
