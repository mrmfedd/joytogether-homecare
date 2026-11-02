import { Suspense } from "react";
import EmployeeLoginForm from "./EmployeeLoginForm";

export default function EmployeeLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-12 text-white">Loading…</div>}>
      <EmployeeLoginForm />
    </Suspense>
  );
}
