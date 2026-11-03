import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageEmployees } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { deactivateEmployeeProfileAction, inviteEmployeeAction } from "./actions";

const classifications = [
  "CAREGIVER",
  "HOME_HEALTH_AIDE",
  "CNA",
  "LPN",
  "RN",
  "HOSPICE_STAFF",
  "TRANSPORTATION_STAFF",
  "SCHEDULER",
  "SUPERVISOR",
] as const;

export default async function AdminEmployeesPage() {
  const user = await requireAdminSession();
  if (!user || !canManageEmployees(user.role)) redirect("/admin");

  const [profiles, invites] = await Promise.all([
    prisma.employeeProfile.findMany({
      include: { user: { select: { email: true, name: true, active: true, lastLoginAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employeeInvitation.findMany({
      where: { acceptedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Employees</h1>
      <p className="mt-1 text-sm text-muted">Invite team members and manage portal access.</p>

      <form action={inviteEmployeeAction} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-5">
        <label className="text-sm">
          Email
          <input name="email" type="email" required className="mt-1 block rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Classification
          <select name="classification" required className="mt-1 block rounded-xl border border-line px-3 py-2">
            {classifications.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
          Send invitation
        </button>
      </form>

      <section className="mt-8">
        <h2 className="font-display text-xl">Active roster</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold">{p.user.name || "—"}</td>
                  <td className="px-4 py-3">{p.user.email}</td>
                  <td className="px-4 py-3">{p.classification.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">{p.employmentStatus}</td>
                  <td className="px-4 py-3">
                    {p.employmentStatus !== "INACTIVE" ? (
                      <form action={deactivateEmployeeProfileAction}>
                        <input type="hidden" name="profileId" value={p.id} />
                        <button type="submit" className="text-xs font-semibold text-red-700">
                          Deactivate
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {invites.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-xl">Pending invitations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {invites.map((inv) => (
              <li key={inv.id} className="rounded-xl border border-line bg-white px-4 py-3">
                {inv.email} · {inv.classification.replace(/_/g, " ")} · expires {inv.expiresAt.toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
