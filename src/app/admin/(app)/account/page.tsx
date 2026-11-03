import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MfaSetupPanel } from "./MfaSetupPanel";

export default async function AdminAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ mfa?: string }>;
}) {
  const sessionUser = await requireAdminSession();
  if (!sessionUser) redirect("/admin/login");

  const params = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, mfaEnabled: true, role: true },
  });
  if (!user?.email) redirect("/admin/login");

  const mustEnableMfa =
    (user.role === "SUPER_ADMIN" || user.role === "ADMIN") && !user.mfaEnabled;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-[var(--midnight)]">Account security</h1>
      <p className="mt-1 text-sm text-muted">
        {user.email} • {user.role}
      </p>
      {mustEnableMfa || params.mfa === "required" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Multi-factor authentication is required for {user.role.replace("_", " ")} accounts before using the
          admin dashboard.
        </p>
      ) : null}
      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Multi-factor authentication</h2>
        <p className="mt-1 text-sm text-muted">
          After MFA is enabled, each sign-in requires your authenticator app code.
        </p>
        <div className="mt-4">
          <MfaSetupPanel email={user.email} mfaEnabled={user.mfaEnabled} />
        </div>
      </section>
    </div>
  );
}
