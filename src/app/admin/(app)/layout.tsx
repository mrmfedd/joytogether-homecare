import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { MfaRequiredGate } from "@/components/admin/MfaRequiredGate";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminMustEnrollSecondFactor } from "@/lib/passkeys/mfa-policy";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { mfaEnabled: true, role: true },
  });

  const mfaRequired = dbUser
    ? await adminMustEnrollSecondFactor(user.id, dbUser.role, dbUser.mfaEnabled)
    : false;

  return (
    <AdminProviders>
      <AdminShell user={user}>
        <MfaRequiredGate required={mfaRequired}>{children}</MfaRequiredGate>
      </AdminShell>
    </AdminProviders>
  );
}
