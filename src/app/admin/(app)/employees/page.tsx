import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageEmployees } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { createEmployeeManuallyAction, deactivateEmployeeProfileAction } from "./actions";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";

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

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    created?: string;
    activation?: string;
    expires?: string;
  }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canManageEmployees(user.role)) redirect("/admin");

  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : null;
  const created = params.created === "1";
  const activationUrl = params.activation ? decodeURIComponent(params.activation) : null;
  const activationExpires = params.expires ? decodeURIComponent(params.expires) : null;

  const [profiles, pendingInvites] = await Promise.all([
    prisma.employeeProfile.findMany({
      include: { user: { select: { email: true, name: true, active: true, lastLoginAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employeeInvitation.findMany({
      where: { acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div data-help-tour="admin-employees">
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/employees"
        title="Employees"
        description="Add team members manually and manage portal access. No invitation email is sent."
      />

      {created ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          <span className="font-semibold">Employee profile created (pending activation).</span>
          {activationUrl ? (
            <>
              {" "}
              Share this one-time activation link privately. It will not be shown again after you leave this page.
              {activationExpires ? (
                <span className="mt-1 block text-green-800">
                  Expires: {new Date(activationExpires).toLocaleString()}
                </span>
              ) : null}
              <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-green-900">
                Activation link
                <textarea
                  readOnly
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-green-300 bg-white px-2 py-2 font-mono text-xs text-[var(--midnight)]"
                  defaultValue={activationUrl}
                />
              </label>
            </>
          ) : (
            " If you did not copy the activation link, resolve duplicate email issues and add the employee again."
          )}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg">Add employee manually</h2>
        <p className="mt-1 text-sm text-muted">
          Creates a pending profile. Copy the one-time activation link below and share it privately (in person or by
          phone). The employee sets their own password on first visit — nothing is emailed.
        </p>
        <form action={createEmployeeManuallyAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Name
            <input name="name" type="text" required autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            Email
            <input name="email" type="email" required autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
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
          <label className="text-sm">
            Phone <span className="text-muted">(optional)</span>
            <input name="phone" type="tel" autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            Department <span className="text-muted">(optional)</span>
            <input name="department" autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
          </label>
          <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
            Create employee
          </button>
        </form>
      </section>

      {pendingInvites.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
          <h2 className="font-display text-lg text-amber-950">Pending activations</h2>
          <p className="mt-1 text-sm text-amber-900">
            These employees have not completed password setup. Re-create or use a new activation link if the prior link
            expired (links are shown only once at creation).
          </p>
          <ul className="mt-3 space-y-1 text-sm text-amber-950">
            {pendingInvites.map((inv) => (
              <li key={inv.id}>
                {inv.email} · {inv.classification.replace(/_/g, " ")} · expires{" "}
                {inv.expiresAt.toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
                  <td className="px-4 py-3">
                    {p.employmentStatus}
                    {!p.user.active && p.employmentStatus === "INVITED" ? (
                      <span className="ml-2 text-xs text-amber-800">(awaiting activation)</span>
                    ) : null}
                  </td>
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
    </div>
  );
}