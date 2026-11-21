import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManagePatientAlerts, canViewPatientDirectory } from "@/lib/patient/permissions";
import { prisma } from "@/lib/prisma";
import { decryptPhi } from "@/lib/patient/phi-crypto";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { updateAlertStatusAction, createFollowUpAlertAction } from "../alert-actions";

export default async function AdminPatientAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewPatientDirectory(user.role)) redirect("/admin");

  const params = await searchParams;
  const alerts = await prisma.patientAlert.findMany({
    where: {
      patientId: params.patientId,
      status: { in: ["NEW", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"] },
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, publicId: true } },
      assignee: { select: { name: true, email: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const canManage = canManagePatientAlerts(user.role);

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/patients/alerts"
        title="Patient Alerts"
        description="Track concerns, follow-ups, and care instruction changes through resolution."
      />

      {canManage && params.patientId ? (
        <form action={createFollowUpAlertAction} className="mt-4 grid gap-2 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
          <input type="hidden" name="patientId" value={params.patientId} />
          <input name="title" placeholder="Follow-up title" required className="rounded-xl border border-line px-3 py-2 text-sm sm:col-span-2" />
          <textarea name="description" placeholder="Description" required rows={2} className="sm:col-span-2 rounded-xl border border-line px-3 py-2 text-sm" />
          <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm sm:col-span-2">
            Create follow-up alert
          </button>
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        {alerts.map((a) => (
          <article key={a.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold">
                <Link href={`/admin/patients/${a.patient.id}`} className="text-[var(--royal)]">
                  {a.patient.lastName}, {a.patient.firstName}
                </Link>{" "}
                · {a.title}
              </p>
              <span className="text-xs font-bold uppercase text-[var(--royal)]">
                {a.priority} · {a.status}
              </span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{decryptPhi(a.description)}</p>
            {canManage && a.status !== "RESOLVED" && a.status !== "CLOSED" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={updateAlertStatusAction}>
                  <input type="hidden" name="alertId" value={a.id} />
                  <input type="hidden" name="status" value="ACKNOWLEDGED" />
                  <button type="submit" className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold">
                    Acknowledge
                  </button>
                </form>
                <form action={updateAlertStatusAction}>
                  <input type="hidden" name="alertId" value={a.id} />
                  <input type="hidden" name="status" value="RESOLVED" />
                  <input type="hidden" name="resolutionNotes" value="Resolved per office review." />
                  <button type="submit" className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold">
                    Resolve
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
        {alerts.length === 0 ? <p className="text-sm text-muted">No alerts.</p> : null}
      </div>
    </div>
  );
}