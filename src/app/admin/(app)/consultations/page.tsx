import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { canManageLeads, canViewLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ConsultationUpdateForm } from "./ConsultationUpdateForm";
import { createAdminConsultationAction } from "./actions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";

export default async function AdminConsultationsPage() {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");
  const canEdit = canManageLeads(user.role);

  const [consultations, recentLeads, assignees] = await Promise.all([
    prisma.consultation.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        lead: { select: { id: true, fullName: true, serviceInterest: true, status: true } },
        assignedTo: { select: { name: true, email: true } },
      },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, fullName: true, serviceInterest: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/consultations"
        title="Consultations"
        description="Scheduling and follow-up — nonclinical notes only."
      />

      {canEdit ? (
        <details className="mt-4 rounded-2xl border border-line bg-white p-5 print:hidden">
          <summary className="cursor-pointer text-sm font-bold text-[var(--royal)]">New consultation</summary>
          <form action={createAdminConsultationAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm font-semibold">
              Lead
              <select name="leadId" required className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm">
                <option value="">Select lead…</option>
                {recentLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.fullName} — {l.serviceInterest}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Scheduled date & time
              <input name="scheduledAt" type="datetime-local" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-semibold">
              Assigned staff
              <select name="assigneeId" defaultValue={user.id} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm">
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name || a.email}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              name="internalNotes"
              placeholder="Internal notes (nonclinical)"
              rows={2}
              className="sm:col-span-2 rounded-xl border border-line px-3 py-2 text-sm"
            />
            <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm sm:col-span-2">
              Create consultation
            </button>
          </form>
        </details>
      ) : null}

      {consultations.length === 0 ? (
        <AdminEmptyState
          className="mt-6"
          title="No consultations yet"
          description="Consultations are created when someone submits the website inquiry form, or when you create one from a lead."
          actionLabel={canEdit ? "View leads" : undefined}
          actionHref={canEdit ? "/admin/leads" : undefined}
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Manage</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.id} className="border-b border-line/70 align-top">
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${c.lead.id}`} className="font-bold text-[var(--royal)]">
                      {c.lead.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.lead.serviceInterest}</td>
                  <td className="px-4 py-3">{c.scheduledAt ? c.scheduledAt.toLocaleString() : "—"}</td>
                  <td className="px-4 py-3">{c.assignedTo?.name || "—"}</td>
                  <td className="min-w-[220px] px-4 py-3">
                    {canEdit ? (
                      <ConsultationUpdateForm
                        id={c.id}
                        status={c.status}
                        scheduledAt={c.scheduledAt}
                        notes={c.internalNotes}
                      />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
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
