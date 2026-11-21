import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canViewPatientDirectory } from "@/lib/patient/permissions";
import { listPatients } from "@/lib/patient/queries";
import { PatientCard } from "@/components/patient/PatientCard";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewPatientDirectory(user.role)) redirect("/admin");

  const params = await searchParams;
  const patients = await listPatients({ query: params.q });

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/patients"
        title="Patients"
        description="Authorized patient registry for care coordination. Do not enter real PHI on staging without approval."
      />
      {params.error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      <form method="get" className="mt-4 flex flex-wrap gap-2 print:hidden">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name or patient ID"
          className="min-w-[12rem] flex-1 rounded-xl border border-line px-3 py-2 text-sm sm:max-w-md"
        />
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
          Search
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {patients.map((p) => (
          <PatientCard
            key={p.id}
            id={p.id}
            publicId={p.publicId}
            firstName={p.firstName}
            lastName={p.lastName}
            status={p.status}
            serviceType={p.serviceType}
            assignmentCount={p.assignments.length}
            alertCount={p._count.alerts}
          />
        ))}
      </div>
      {patients.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No patients match this view. Add a patient when your office is ready.</p>
      ) : null}
    </div>
  );
}