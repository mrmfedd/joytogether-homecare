import { redirect } from "next/navigation";
import Link from "next/link";
import { requireEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployeeAccountPage() {
  const sessionUser = await requireEmployeeSession();
  if (!sessionUser) redirect("/employee/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, name: true },
  });
  if (!user?.email) redirect("/employee/login");

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-[var(--midnight)]">My account</h1>
      <p className="mt-1 text-sm text-muted">
        {user.name || "Employee"} • {user.email}
      </p>
      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Signing in</h2>
        <p className="mt-2 text-sm text-muted">
          Use your registered email address as your username and your password to sign in.
          No authenticator code or passkey is required for employee login.
        </p>
        <Link href="/employee/forgot-password" className="mt-3 inline-block text-sm font-medium text-[var(--royal)] underline">
          Forgot your password?
        </Link>
      </section>
    </div>
  );
}
