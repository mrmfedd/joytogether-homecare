import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  assignLeadAction,
  createFollowUpTaskAction,
  completeFollowUpTaskAction,
  scheduleConsultationAction,
  updateLeadStatusAction,
} from "@/app/admin/(app)/leads/actions";
import { requireAdminSession } from "@/lib/auth";
import { listAssignableStaff } from "@/lib/admin/staff";
import { canManageLeads, canViewLeadContact, canViewLeads } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canViewLeads(user.role)) redirect("/admin");

  const { id } = await params;
  const [lead, staff, tasks] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { createdAt: "desc" }, take: 30, include: { user: { select: { name: true, email: true } } } },
        consultations: true,
        assignedTo: true,
      },
    }),
    listAssignableStaff(),
    prisma.followUpTask.findMany({ where: { leadId: id }, orderBy: { dueAt: "asc" } }),
  ]);
  if (!lead) notFound();

  const showContact = canViewLeadContact(user.role);
  const canEdit = canManageLeads(user.role);
  const consultation = lead.consultations[0];

  return (
    <div className="max-w-4xl">
      <Link href="/admin/leads" className="text-sm font-semibold text-[var(--royal)] hover:underline">
        ← All leads
      </Link>
      <h1 className="mt-2 font-display text-3xl text-[var(--midnight)]">{lead.fullName}</h1>
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
          {lead.nonClinicalNotes ? (
            <p className="mt-3 rounded-lg bg-[var(--cream)] p-3 text-sm">{lead.nonClinicalNotes}</p>
          ) : null}
        </div>
      </div>

      {canEdit ? (
        <>
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

          <form action={assignLeadAction} className="mt-4 rounded-2xl border border-line bg-white p-5">
            <h2 className="font-semibold">Assign staff</h2>
            <input type="hidden" name="leadId" value={lead.id} />
            <div className="mt-3 flex flex-wrap gap-3">
              <select name="assigneeId" defaultValue={lead.assignedToId || ""} className="rounded-xl border border-line px-3 py-2 text-sm">
                <option value="">Select staff…</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.email} ({s.role})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
                Assign
              </button>
            </div>
          </form>

          {consultation ? (
            <form action={scheduleConsultationAction} className="mt-4 rounded-2xl border border-line bg-white p-5">
              <h2 className="font-semibold">Schedule consultation</h2>
              <input type="hidden" name="leadId" value={lead.id} />
              <input type="hidden" name="consultationId" value={consultation.id} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Date & time
                  <input type="datetime-local" name="scheduledAt" required className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-semibold">
                  Assign to
                  <select name="assigneeId" defaultValue={lead.assignedToId || user.id} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm">
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.email}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="submit" className="btn btn-purple mt-3 px-4 py-2 text-sm">
                Schedule
              </button>
            </form>
          ) : null}

          <form action={createFollowUpTaskAction} className="mt-4 rounded-2xl border border-line bg-white p-5">
            <h2 className="font-semibold">Create follow-up task</h2>
            <input type="hidden" name="leadId" value={lead.id} />
            <div className="mt-3 grid gap-3">
              <input name="title" required placeholder="Task title" className="rounded-xl border border-line px-3 py-2 text-sm" />
              <div className="flex flex-wrap gap-3">
                <input type="datetime-local" name="dueAt" className="rounded-xl border border-line px-3 py-2 text-sm" />
                <select name="assigneeId" defaultValue={user.id} className="rounded-xl border border-line px-3 py-2 text-sm">
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.email}
                    </option>
                  ))}
                </select>
              </div>
              <textarea name="notes" rows={2} placeholder="Notes" className="rounded-xl border border-line px-3 py-2 text-sm" />
              <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm">
                Add task
              </button>
            </div>
          </form>
        </>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-xl">Follow-up tasks</h2>
        <ul className="mt-3 space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white p-4 text-sm">
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-muted">
                  {t.status} {t.dueAt ? `• due ${t.dueAt.toLocaleString()}` : ""}
                </p>
              </div>
              {canEdit && t.status === "OPEN" ? (
                <form action={completeFollowUpTaskAction}>
                  <input type="hidden" name="taskId" value={t.id} />
                  <input type="hidden" name="leadId" value={lead.id} />
                  <button type="submit" className="rounded-lg bg-[var(--joy-green)] px-3 py-1 text-xs font-bold text-white">
                    Mark done
                  </button>
                </form>
              ) : null}
            </li>
          ))}
          {tasks.length === 0 ? <li className="text-sm text-muted">No tasks yet.</li> : null}
        </ul>
      </section>

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
