import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canViewPatientDirectory } from "@/lib/patient/permissions";
import { listPatients } from "@/lib/patient/queries";
import { PatientCard } from "@/components/patient/PatientCard";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";

export default async function ActivePatientsPage() {
  const user = await requireAdminSession();
  if (!user || !canViewPatientDirectory(user.role)) redirect("/admin");

  const patients = await listPatients({ status: ["ACTIVE", "PENDING", "ON_HOLD"] });

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/patients/active"
        title="Active Patients"
        description="Patients currently receiving or preparing for services."
      />
      <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}