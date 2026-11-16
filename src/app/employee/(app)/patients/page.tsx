import Link from "next/link";
import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { listEmployeeAssignedPatients } from "@/lib/patient/employee-queries";
import { patientServiceLabels } from "@/lib/patient/labels";

export default async function EmployeePatientsPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const rows = await listEmployeeAssignedPatients(profile.id, user.id);

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">My Patients</h1>
      <p className="mt-2 text-sm text-muted">Only patients with an active assignment appear here.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <Link
            key={row.patient.id}
            href={`/employee/patients/${row.patient.id}`}
            className="block rounded-2xl border border-line bg-white p-5 shadow-sm active:scale-[0.99]"
          >
            <p className="text-lg font-semibold">
              {row.patient.lastName}, {row.patient.firstName}
            </p>
            <p className="text-xs text-muted">{row.patient.publicId}</p>
            <p className="mt-2 text-sm">{patientServiceLabels[row.serviceType]}</p>
            <p className="mt-1 text-sm text-muted">Assignment: {row.status.toLowerCase()}</p>
            {row.patient.nextVisit ? (
              <p className="mt-2 text-sm font-semibold text-[var(--royal)]">
                Next visit: {row.patient.nextVisit.scheduledStart.toLocaleString()}
              </p>
            ) : null}
            {row.patient.alerts.length > 0 ? (
              <p className="mt-2 text-sm font-semibold text-amber-800">Care alerts on chart — review in profile</p>
            ) : null}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No assigned patients. Contact the office if you expect assignments.</p>
      ) : null}

      <p className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Medical emergencies: call <strong>911</strong> and follow agency emergency protocols. This portal is not monitored 24/7.
      </p>
    </div>
  );
}