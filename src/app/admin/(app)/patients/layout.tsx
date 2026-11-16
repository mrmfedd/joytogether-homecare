import { Suspense } from "react";
import { PatientsSubnav } from "@/components/patient/PatientsSubnav";

export default function PatientsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-help-tour="admin-patients">
      <Suspense fallback={null}>
        <PatientsSubnav />
      </Suspense>
      <div className="mt-6">{children}</div>
    </div>
  );
}