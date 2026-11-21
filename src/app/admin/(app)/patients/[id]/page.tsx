import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManagePatients, canViewPatientDirectory } from "@/lib/patient/permissions";
import { getPatientById } from "@/lib/patient/queries";
import { buildPatientTimeline } from "@/lib/patient/timeline";
import { patientServiceLabels, patientStatusLabels } from "@/lib/patient/labels";
import { PatientTimeline } from "@/components/patient/PatientTimeline";
import { PhiFieldLabel } from "@/components/patient/PhiFieldLabel";
import { logPatientChartAccess, updatePatientStatusAction } from "../actions";

export default async function PatientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewPatientDirectory(user.role)) redirect("/admin");

  const { id } = await params;
  const sp = await searchParams;
  const patient = await getPatientById(id);
  if (!patient) notFound();

  await logPatientChartAccess(id, user.id, user.role);
  const timeline = await buildPatientTimeline(id);
  const canEdit = canManagePatients(user.role);
  const primaryContact = patient.emergencyContacts[0];
  const instructions = patient.activeInstructions;

  return (
    <div className="space-y-8">
      {sp.created === "1" ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Patient registered. Assign caregivers from the Assignments section when ready.
        </p>
      ) : null}

      <header className="rounded-2xl border border-line bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{patient.publicId}</p>
            <h1 className="font-display text-3xl text-[var(--midnight)]">
              {patient.lastName}, {patient.firstName}
              {patient.middleName ? ` ${patient.middleName.charAt(0)}.` : ""}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {patientServiceLabels[patient.serviceType]} · {patientStatusLabels[patient.status]}
            </p>
            <p className="mt-1 text-sm text-muted">
              DOB {patient.dateOfBirth.toLocaleDateString()} · {patient.phone}
              {patient.email ? ` · ${patient.email}` : ""}
            </p>
            <p className="mt-1 text-sm text-muted">
              {patient.addressLine1}
              {patient.addressLine2 ? `, ${patient.addressLine2}` : ""}, {patient.city}, {patient.state}{" "}
              {patient.postalCode}
            </p>
          </div>
          {canEdit ? (
            <form action={updatePatientStatusAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="patientId" value={patient.id} />
              <label className="text-xs font-bold uppercase text-muted">
                Status
                <select name="status" defaultValue={patient.status} className="mt-1 rounded-xl border border-line px-3 py-2 text-sm">
                  {Object.entries(patientStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-purple px-3 py-2 text-sm">
                Update
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 print:hidden">
          <Link href={`/admin/patients/assignments?patientId=${patient.id}`} className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold">
            Assign caregiver
          </Link>
          <Link href={`/admin/patients/notes?patientId=${patient.id}`} className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold">
            View notes
          </Link>
          <Link href={`/admin/messages?patientId=${patient.id}`} className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold">
            Send message
          </Link>
          <Link href={`/admin/patients/alerts?patientId=${patient.id}`} className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold">
            Create follow-up
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-xl">Emergency contact</h2>
          {primaryContact ? (
            <p className="mt-3 text-sm">
              {primaryContact.name} ({primaryContact.relationship}) · {primaryContact.phone}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">None on file.</p>
          )}
          <h2 className="font-display mt-6 text-xl">Assigned caregivers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {patient.assignments.map((a) => (
              <li key={a.id}>
                {a.caregiver.user.name ?? "Employee"} · {a.status} · from {a.startDate.toLocaleDateString()}
              </li>
            ))}
            {patient.assignments.length === 0 ? <li className="text-muted">No assignments yet.</li> : null}
          </ul>
        </article>

        <article className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-xl">Care instructions</h2>
          {instructions ? (
            <dl className="mt-3 space-y-3 text-sm">
              <InstructionRow label="Care" value={instructions.careInstructions} phi />
              <InstructionRow label="Mobility" value={instructions.mobilityRequirements} phi />
              <InstructionRow label="Diet" value={instructions.dietaryRestrictions} phi />
              <InstructionRow label="Allergies" value={instructions.allergies} phi />
              <InstructionRow label="Conditions" value={instructions.medicalConditions} phi />
              <InstructionRow label="Precautions" value={instructions.specialPrecautions} phi />
              <InstructionRow label="Additional" value={instructions.additionalInstructions} />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted">No care instructions on file.</p>
          )}
          {patient.internalOfficeNotes ? (
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-xs font-bold uppercase text-muted">
                <PhiFieldLabel>Office notes</PhiFieldLabel>
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{patient.internalOfficeNotes}</p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl">Patient activity timeline</h2>
        <p className="mt-1 text-sm text-muted">Recent notes, visits, assignments, alerts, and audited changes.</p>
        <div className="mt-4">
          <PatientTimeline entries={timeline} />
        </div>
      </section>
    </div>
  );
}

function InstructionRow({ label, value, phi }: { label: string; value: string | null | undefined; phi?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-semibold text-muted">
        {phi ? <PhiFieldLabel>{label}</PhiFieldLabel> : label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}