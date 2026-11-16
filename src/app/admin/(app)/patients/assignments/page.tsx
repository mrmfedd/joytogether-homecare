import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManagePatients, canViewPatientDirectory } from "@/lib/patient/permissions";
import { listPatientAssignments } from "@/lib/patient/assignments";
import { listPatients, listOfficeCoordinators } from "@/lib/patient/queries";
import { prisma } from "@/lib/prisma";
import { patientServiceLabels } from "@/lib/patient/labels";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { createAssignmentAction, endAssignmentAction } from "../assignment-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function PatientAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; error?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewPatientDirectory(user.role)) redirect("/admin");

  const params = await searchParams;
  const assignments = await listPatientAssignments({ patientId: params.patientId });
  const [patients, caregivers, supervisors] = await Promise.all([
    listPatients(),
    prisma.employeeProfile.findMany({
      where: { employmentStatus: { in: ["ACTIVE", "ON_LEAVE"] } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    listOfficeCoordinators(),
  ]);

  const canEdit = canManagePatients(user.role);
  const selectedPatient = params.patientId ?? patients[0]?.id ?? "";

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/patients/assignments"
        title="Patient Assignments"
        description="Associate caregivers with patients. Ended assignments revoke caregiver chart access."
      />

      {params.error ? (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{params.error}</p>
      ) : null}

      {canEdit ? (
        <form action={createAssignmentAction} className="mt-4 grid gap-3 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            Patient
            <select name="patientId" required className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" defaultValue={selectedPatient}>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName} ({p.publicId})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Caregiver
            <select name="profileId" required className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm">
              {caregivers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.user.name ?? c.user.email} · {c.classification}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Service
            <select name="serviceType" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" defaultValue="PRIVATE_DUTY">
              {Object.entries(patientServiceLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Start date
            <input name="startDate" type="date" required className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            End date (optional)
            <input name="endDate" type="date" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            Supervisor
            <select name="supervisorUserId" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" defaultValue="">
              <option value="">—</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? s.email}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Assignment instructions
            <textarea name="instructions" rows={2} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm sm:col-span-2">
            Assign caregiver
          </button>
        </form>
      ) : null}

      <div className="mt-8 space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold">
                {a.patient.lastName}, {a.patient.firstName} · {a.caregiver.user.name}
              </p>
              <span className="text-xs font-bold uppercase text-[var(--royal)]">{a.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {patientServiceLabels[a.serviceType]} · {a.startDate.toLocaleDateString()}
              {a.endDate ? ` – ${a.endDate.toLocaleDateString()}` : ""}
            </p>
            {canEdit && a.status !== "ENDED" ? (
              <form action={endAssignmentAction} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="assignmentId" value={a.id} />
                <input type="hidden" name="patientId" value={a.patientId} />
                <input
                  name="endedReason"
                  placeholder="End reason"
                  className="min-w-[12rem] flex-1 rounded-xl border border-line px-3 py-2 text-sm"
                />
                <ConfirmSubmitButton
                  type="submit"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900"
                  confirmMessage="End this assignment? The caregiver will lose access to this patient chart."
                >
                  End assignment
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </div>
        ))}
        {assignments.length === 0 ? <p className="text-sm text-muted">No assignments recorded.</p> : null}
      </div>
    </div>
  );
}