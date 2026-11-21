"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Forces SUPER_ADMIN / ADMIN to enable MFA before using the dashboard. */
export function MfaRequiredGate({
  required,
  children,
}: {
  required: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const onAccount = pathname === "/admin/account";
  const onHelp = pathname.startsWith("/admin/help");
  const onPatientCare =
    pathname.startsWith("/admin/patients") || pathname.startsWith("/admin/messages");

  useEffect(() => {
    if (required && !onAccount && !onHelp && !onPatientCare) {
      router.replace("/admin/account?mfa=required");
    }
  }, [required, onAccount, onHelp, onPatientCare, router]);

  if (required && !onAccount && !onHelp && !onPatientCare) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        Multi-factor authentication is required for your role. Redirecting to account security…
      </div>
    );
  }

  return children;
}
