import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeMfaSetupPanel } from "./EmployeeMfaSetupPanel";

export default async function EmployeeAccountPage() {
  const sessionUser = await requireEmployeeSession();
  if (!sessionUser) redirect("/employee/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, mfaEnabled: true, name: true },
  });
  if (!user?.email) redirect("/employee/login");

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-[var(--midnight)]">Profile & security</h1>
      <p className="mt-1 text-sm text-muted">
        {user.name || "Employee"} • {user.email}
      </p>
      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Multi-factor authentication</h2>
        <p className="mt-1 text-sm text-muted">Optional extra protection for your employee account.</p>
        <div className="mt-4">
          <EmployeeMfaSetupPanel email={user.email} mfaEnabled={user.mfaEnabled} />
        </div>
      </section>
    </div>
  );
}
