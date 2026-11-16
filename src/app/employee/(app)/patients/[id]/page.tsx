import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { getEmployeePatientDetail } from "@/lib/patient/employee-queries";
import { careNoteCategoryLabels, patientServiceLabels } from "@/lib/patient/labels";
import { decryptCareNoteFields } from "@/lib/patient/care-notes";
import { employeeContactOfficeAction, employeeReportConcernAction, employeeSaveCareNoteAction } from "../actions";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "visits", label: "My Visits" },
  { id: "notes", label: "Care Notes" },
  { id: "concern", label: "Report Concern" },
  { id: "messages", label: "Contact Office" },
] as const;

export default async function EmployeePatientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; saved?: string; sent?: string; error?: string }>;
}) {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const { id } = await params;
  const sp = await searchParams;
  const tab = tabs.some((t) => t.id === sp.tab) ? sp.tab! : "overview";

  const detail = await getEmployeePatientDetail(profile.id, user.id, id);
  if (!detail) notFound();

  return (
    <div className="pb-8">
      <Link href="/employee/patients" className="text-sm font-semibold text-[var(--royal)]">
        ← My Patients
      </Link>
      <h1 className="mt-3 font-display text-3xl text-[var(--midnight)]">
        {detail.lastName}, {detail.firstName}
      </h1>
      <p className="text-sm text-muted">
        {detail.publicId} · {patientServiceLabels[detail.serviceType]}
      </p>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Patient sections">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/employee/patients/${id}?tab=${t.id}`}
            className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold ${
              tab === t.id ? "bg-[var(--purple-50)] text-[var(--royal)]" : "border border-line bg-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {sp.error ? <p className="mt-4 text-sm text-red-800">{sp.error}</p> : null}
      {sp.saved ? <p className="mt-4 text-sm text-green-800">Care note saved.</p> : null}
      {sp.sent ? <p className="mt-4 text-sm text-green-800">Submitted to office.</p> : null}

      <div className="mt-6">
        {tab === "overview" ? (
          <section className="space-y-4 rounded-2xl border border-line bg-white p-5 text-sm">
            <p>
              <span className="font-semibold">Agency phone on file:</span> {detail.phone}
            </p>
            {detail.emergency ? (
              <p>
                <span className="font-semibold">Emergency:</span> {detail.emergency.name} · {detail.emergency.phone}
              </p>
            ) : null}
            {detail.instructions?.careInstructions ? (
              <p className="whitespace-pre-wrap">
                <span className="font-semibold">Care instructions:</span> {detail.instructions.careInstructions}
              </p>
            ) : null}
            {detail.instructions?.specialPrecautions ? (
              <p className="whitespace-pre-wrap">
                <span className="font-semibold">Precautions:</span> {detail.instructions.specialPrecautions}
              </p>
            ) : null}
            <p className="text-xs text-muted">
              Document only within your authorized scope. Medication administration and clinical diagnosis require appropriate licensure.
            </p>
          </section>
        ) : null}

        {tab === "visits" ? (
          <ul className="space-y-3">
            {detail.visits.map((v) => (
              <li key={v.id} className="rounded-2xl border border-line bg-white p-4 text-sm">
                <p className="font-semibold">{v.scheduledStart.toLocaleString()}</p>
                <p className="text-muted">Status: {v.status}</p>
              </li>
            ))}
            {detail.visits.length === 0 ? <p className="text-sm text-muted">No visits scheduled.</p> : null}
          </ul>
        ) : null}

        {tab === "notes" ? (
          <div>
            <form action={employeeSaveCareNoteAction} className="space-y-4 rounded-2xl border border-line bg-white p-5">
              <input type="hidden" name="patientId" value={id} />
              <h2 className="font-display text-xl">Add care note</h2>
              <label className="block text-sm font-semibold">
                Visit date
                <input name="visitDate" type="date" required className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
              </label>
              <label className="block text-sm font-semibold">
                Visit time
                <input name="visitTime" type="time" className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
              </label>
              <label className="block text-sm font-semibold">
                Category
                <select name="category" className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" defaultValue="DAILY_CARE">
                  {Object.entries(careNoteCategoryLabels).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Care activities performed
                <textarea name="careActivities" rows={3} className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
              </label>
              <label className="block text-sm font-semibold">
                Observations
                <textarea name="observations" rows={3} className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
              </label>
              <label className="block text-sm font-semibold">
                Follow-up required?
                <select name="followUpRequired" className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" defaultValue="no">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn-purple min-h-12 px-6 py-3 text-base font-semibold">
                  Save draft
                </button>
                <button type="submit" name="submit" value="1" className="min-h-12 rounded-xl border border-line px-6 py-3 text-base font-semibold">
                  Submit note
                </button>
              </div>
            </form>
            <h3 className="mt-8 font-semibold">Previous notes</h3>
            <ul className="mt-3 space-y-3">
              {detail.notes.map((n) => {
                const note = decryptCareNoteFields(n);
                return (
                  <li key={n.id} className="rounded-xl border border-line bg-white p-4 text-sm">
                    <p className="font-semibold">
                      {careNoteCategoryLabels[n.category]} · {n.status} · {n.visitDate.toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-muted">{note.observations}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {tab === "concern" ? (
          <form action={employeeReportConcernAction} className="space-y-4 rounded-2xl border border-line bg-white p-5">
            <input type="hidden" name="patientId" value={id} />
            <h2 className="font-display text-xl">Report concern</h2>
            <label className="block text-sm font-semibold">
              Title
              <input name="title" required className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
            </label>
            <label className="block text-sm font-semibold">
              Priority
              <select name="priority" className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" defaultValue="NORMAL">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Observations (factual)
              <textarea name="description" rows={4} required className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
            </label>
            <button type="submit" className="btn btn-purple min-h-12 w-full py-3 text-base font-semibold sm:w-auto">
              Submit concern
            </button>
          </form>
        ) : null}

        {tab === "messages" ? (
          <form action={employeeContactOfficeAction} className="space-y-4 rounded-2xl border border-line bg-white p-5">
            <input type="hidden" name="patientId" value={id} />
            <h2 className="font-display text-xl">Contact office</h2>
            <p className="text-sm text-muted">Not for emergencies — call 911 when needed.</p>
            <label className="block text-sm font-semibold">
              Subject
              <input name="subject" required className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
            </label>
            <label className="block text-sm font-semibold">
              Message
              <textarea name="body" rows={4} required className="mt-1 w-full rounded-xl border border-line px-3 py-3 text-base" />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="urgent" value="1" className="h-5 w-5" />
              Urgent — office attention required
            </label>
            <button type="submit" className="btn btn-purple min-h-12 w-full py-3 text-base font-semibold">
              Send message
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}