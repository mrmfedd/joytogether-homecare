import { requireAdminSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const user = await requireAdminSession();
  if (!user || !canManageUsers(user.role)) redirect("/admin");

  const [users, invites] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, name: true, role: true, active: true, lastLoginAt: true } }),
    prisma.adminInvitation.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Administrators</h1>
      <p className="body-muted mt-1 text-sm">
        Only SUPER_ADMIN can manage accounts. New admins are invited via one-time links — no public registration.
      </p>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Create an invitation locally against the preview/dev database:
        <code className="mt-2 block rounded bg-white/80 p-2 text-xs">
          ADMIN_INVITE_EMAIL=colleague@example.com npx tsx scripts/create-admin-invite.ts
        </code>
      </div>
      <section className="mt-8">
        <h2 className="font-semibold">Active users</h2>
        <ul className="mt-3 space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap justify-between gap-2 rounded-xl border border-line bg-white p-4 text-sm">
              <span>
                {u.name || u.email} — {u.role} {u.active ? "" : "(inactive)"}
              </span>
              <span className="text-muted">{u.lastLoginAt ? u.lastLoginAt.toLocaleString() : "Never logged in"}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">Recent invitations</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {invites.map((i) => (
            <li key={i.id} className="rounded-xl border border-line bg-white p-3">
              {i.email} — {i.role} — {i.acceptedAt ? "accepted" : i.expiresAt < new Date() ? "expired" : "pending"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
