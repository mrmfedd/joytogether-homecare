import Link from "next/link";
import { UserRole } from "@/generated/prisma";
import { sendAdminInviteAction, setUserActiveAction } from "@/app/admin/(app)/users/actions";

const roles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR", "CONTENT_EDITOR", "RECRUITER", "VIEWER"];

export function AdminUsersPageClient({
  users,
  invites,
  error,
  sent,
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
}) {
  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Administrators</h1>
      <p className="body-muted mt-1 text-sm">
        Invite colleagues with one-time links emailed through Resend. Tokens are never shown in the admin UI or logs.
      </p>

      {sent ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Invitation email sent. Previous pending invites for that address were invalidated.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p>
      ) : null}

      <section className="mt-8 max-w-xl rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Send invitation</h2>
        <form action={sendAdminInviteAction} className="mt-4 grid gap-3">
          <label className="text-sm font-semibold">
            Email
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              placeholder="joytogetherhomecare@gmail.com"
            />
          </label>
          <label className="text-sm font-semibold">
            Role
            <select name="role" defaultValue="ADMIN" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm">
            Email secure invite
          </button>
        </form>
        <p className="mt-3 text-xs text-muted">
          CLI alternative:{" "}
          <code className="rounded bg-[var(--cream)] px-1">ADMIN_INVITE_EMAIL=… npx tsx scripts/create-admin-invite.ts</code>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Active users</h2>
        <ul className="mt-3 space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white p-4 text-sm">
              <span>
                {u.name || u.email} — {u.role} {u.active ? "" : "(inactive)"}
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
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Recent invitations</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {invites.map((i) => (
            <li key={i.id} className="rounded-xl border border-line bg-white p-3">
              {i.email} — {i.role} —{" "}
              {i.acceptedAt ? "accepted" : i.expiresAt < new Date() ? "expired" : "pending"} — sent{" "}
              {i.createdAt.toLocaleDateString()}
            </li>
          ))}
          {invites.length === 0 ? <li className="text-muted">No invitations yet.</li> : null}
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted">
        Owner onboarding: accept the invite, sign in, then enable MFA under{" "}
        <Link href="/admin/account" className="font-semibold text-[var(--royal)]">
          Security
        </Link>
        .
      </p>
    </div>
  );
}
