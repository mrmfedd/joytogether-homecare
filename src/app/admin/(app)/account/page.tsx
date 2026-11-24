import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PasskeyManagerPanel } from "@/components/auth/PasskeyManagerPanel";

export default async function AdminAccountPage() {
  const sessionUser = await requireAdminSession();
  if (!sessionUser) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, role: true },
  });
  if (!user?.email) redirect("/admin/login");

  const passkeys = await prisma.userPasskey.findMany({
    where: { userId: sessionUser.id },
    select: { id: true, friendlyName: true, createdAt: true, lastUsedAt: true, backedUp: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-[var(--midnight)]">Account security</h1>
      <p className="mt-1 text-sm text-muted">
        {user.email} • {user.role}
      </p>
      <PasskeyManagerPanel
        passkeys={passkeys.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          lastUsedAt: p.lastUsedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
