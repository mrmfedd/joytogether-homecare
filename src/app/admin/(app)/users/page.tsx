import { requireAdminSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminUsersPageClient } from "@/components/admin/AdminUsersPageClient";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canManageUsers(user.role)) redirect("/admin");

  const params = await searchParams;

  const [users, invites] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, active: true, lastLoginAt: true },
    }),
    prisma.adminInvitation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, email: true, role: true, acceptedAt: true, expiresAt: true, createdAt: true },
    }),
  ]);

  return (
    <AdminUsersPageClient
      users={users}
      invites={invites}
      error={params.error ? decodeURIComponent(params.error) : undefined}
      sent={params.sent === "1"}
    />
  );
}
