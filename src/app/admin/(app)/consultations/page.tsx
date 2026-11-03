import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { canManageLeads, canViewLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ConsultationUpdateForm } from "./ConsultationUpdateForm";

export default async function AdminConsultationsPage() {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");
  const canEdit = canManageLeads(user.role);

  const consultations = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      lead: { select: { id: true, fullName: true, serviceInterest: true, status: true } },
      assignedTo: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Consultations</h1>
      <p className="body-muted mt-1 text-sm">Scheduling and follow-up — nonclinical notes only.</p>
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
                <td className="px-4 py-3">
                  {c.scheduledAt ? c.scheduledAt.toLocaleString() : "—"}
                </td>
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
    </div>
  );
}
