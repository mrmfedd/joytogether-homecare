import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MfaSetupPanel } from "./MfaSetupPanel";

export default async function AdminAccountPage() {
  const sessionUser = await requireAdminSession();
  if (!sessionUser) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, mfaEnabled: true, role: true },
  });
  if (!user?.email) redirect("/admin/login");

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-[var(--midnight)]">Account security</h1>
      <p className="mt-1 text-sm text-muted">{user.email} • {user.role}</p>
      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Multi-factor authentication</h2>
        <p className="mt-1 text-sm text-muted">Required for SUPER_ADMIN and ADMIN when enabled.</p>
        <div className="mt-4">
          <MfaSetupPanel email={user.email} mfaEnabled={user.mfaEnabled} />
        </div>
      </section>
    </div>
  );
}
