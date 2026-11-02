import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-12 text-white">Loading…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
