import Link from "next/link";
import type { PatientStatus } from "@/generated/prisma";
import { patientServiceLabels, patientStatusLabels } from "@/lib/patient/labels";

type PatientCardProps = {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  status: PatientStatus;
  serviceType: keyof typeof patientServiceLabels;
  assignmentCount: number;
  alertCount: number;
};

export function PatientCard({
  id,
  publicId,
  firstName,
  lastName,
  status,
  serviceType,
  assignmentCount,
  alertCount,
}: PatientCardProps) {
  return (
    <Link
      href={`/admin/patients/${id}`}
      className="block rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-[var(--joy-green)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[var(--midnight)]">
            {lastName}, {firstName}
          </p>
          <p className="text-xs text-muted">{publicId}</p>
        </div>
        <span className="rounded-lg bg-[var(--purple-50)] px-2 py-1 text-xs font-bold uppercase text-[var(--royal)]">
          {patientStatusLabels[status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">{patientServiceLabels[serviceType]}</p>
      <p className="mt-2 text-xs text-muted">
        {assignmentCount} active assignment{assignmentCount === 1 ? "" : "s"}
        {alertCount > 0 ? ` · ${alertCount} open alert${alertCount === 1 ? "" : "s"}` : ""}
      </p>
    </Link>
  );
}