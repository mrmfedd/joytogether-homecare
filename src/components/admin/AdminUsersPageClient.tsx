import { UserRole } from "@/generated/prisma";
import {
  createAdminManuallyAction,
  sendAdminInviteAction,
  setUserActiveAction,
} from "@/app/admin/(app)/users/actions";

const roles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR", "CONTENT_EDITOR", "RECRUITER", "VIEWER"];

export function AdminUsersPageClient({
  users,
  invites,
  error,
  sent,
  created,
  activationUrl,
  activationExpires,
}: {
  users: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    active: boolean;
    lastLoginAt: Date | null;
  }[];
  invites: {
    id: string;
    email: string;
    role: UserRole;
    acceptedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
  }[];
  error?: string;
  sent?: boolean;
  created?: boolean;
  activationUrl?: string;
  activationExpires?: string;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Administrators</h1>
      <p className="body-muted mt-1 text-sm">
        Add administrators manually and manage portal access. No invitation email is sent.
      </p>

      {created ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          <span className="font-semibold">Administrator invite created (pending setup).</span>
          {activationUrl ? (
            <>
              {" "}
              Share this one-time setup link privately. It will not be shown again after you leave this page.
              {activationExpires ? (
                <span className="mt-1 block text-green-800">
                  Expires: {new Date(activationExpires).toLocaleString()}
                </span>
              ) : null}
              <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-green-900">
                Setup link
                <textarea
                  readOnly
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-green-300 bg-white px-2 py-2 font-mono text-xs text-[var(--midnight)]"
                  defaultValue={activationUrl}
                />
              </label>
            </>
          ) : (
            " If you did not copy the setup link, resolve duplicate email issues and add the administrator again."
          )}
        </p>
      ) : null}
      {sent ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Invitation email sent. Previous pending invites for that address were invalidated.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mt-8 max-w-xl rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Add administrator manually</h2>
        <p className="mt-1 text-sm text-muted">
          Creates a pending invitation. Copy the one-time setup link and share it privately (in person or by phone).
          They set their own password on first visit — nothing is emailed.
        </p>
        <form action={createAdminManuallyAction} className="mt-4 grid gap-3">
          <label className="text-sm font-semibold">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              placeholder="joytogetherhomecare@gmail.com"
            />
          </label>
          <label className="text-sm font-semibold">
            Role
            <select name="role" defaultValue="ADMIN" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm">
            Create administrator
          </button>
        </form>
      </section>

      <details className="mt-6 max-w-xl rounded-2xl border border-line bg-white p-5">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--royal)]">
          Optional: send setup link by email (Resend)
        </summary>
        <form action={sendAdminInviteAction} className="mt-4 grid gap-3">
          <label className="text-sm font-semibold">
            Email
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Role
            <select name="role" defaultValue="ADMIN" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn w-fit border border-line px-4 py-2 text-sm">
            Email secure invite
          </button>
        </form>
      </details>

      <section className="mt-10">
        <h2 className="font-semibold">Active administrators</h2>
        <ul className="mt-3 space-y-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white p-4 text-sm"
            >
              <span>
                {u.name || u.email} — {u.role.replace(/_/g, " ")} {u.active ? "" : "(inactive)"}
              </span>
              <span className="text-muted">{u.lastLoginAt ? u.lastLoginAt.toLocaleString() : "Never logged in"}</span>
              {u.active ? (
                <form action={setUserActiveAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="active" value="false" />
                  <button type="submit" className="text-xs font-bold text-amber-800">
                    Deactivate
                  </button>
                </form>
              ) : (
                <form action={setUserActiveAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="active" value="true" />
                  <button type="submit" className="text-xs font-bold text-[var(--royal)]">
                    Reactivate
                  </button>
                </form>
              )}
            </li>
          ))}
          {users.length === 0 ? <li className="text-sm text-muted">No administrators yet.</li> : null}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Pending invitations</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {invites.map((i) => (
            <li key={i.id} className="rounded-xl border border-line bg-white p-3">
              {i.email} — {i.role.replace(/_/g, " ")} —{" "}
              {i.acceptedAt ? "accepted" : i.expiresAt < new Date() ? "expired" : "pending"} — created{" "}
              {i.createdAt.toLocaleDateString()}
              {!i.acceptedAt && i.expiresAt >= new Date() ? (
                <span className="mt-1 block text-xs text-muted">Expires {i.expiresAt.toLocaleString()}</span>
              ) : null}
            </li>
          ))}
          {invites.length === 0 ? <li className="text-muted">No pending invitations.</li> : null}
        </ul>
      </section>

    </div>
  );
}