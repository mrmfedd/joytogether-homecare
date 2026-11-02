import { acceptInviteAction } from "./actions";
import { validateAdminInviteToken } from "@/lib/admin/invitations";

const errorCopy: Record<string, string> = {
  missing: "This invitation link is incomplete. Request a new invite from your administrator.",
  invalid: "This invitation link is not valid. Request a new invite.",
  expired: "This invitation has expired. Request a new invite.",
  used: "This invitation was already used.",
  account_exists: "An account already exists for this email. Use forgot password or sign in.",
  password: "Passwords must match and be at least 12 characters.",
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const validation = token ? await validateAdminInviteToken(token) : { ok: false as const, reason: "missing" as const };
  const showForm = validation.ok;
  const errorMessage = error ? errorCopy[error] || "Unable to accept invitation." : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl">Accept admin invitation</h1>
      <p className="mt-2 text-sm text-white/80">Create your password to activate your account.</p>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-300/40 bg-red-950/40 p-4 text-sm text-red-100">{errorMessage}</p>
      ) : null}

      {!showForm ? (
        <p className="mt-6 text-sm text-white/80">
          {validation.ok === false && !errorMessage
            ? errorCopy[validation.reason]
            : null}
        </p>
      ) : (
        <form action={acceptInviteAction} className="mt-8 space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
          <input type="hidden" name="token" value={token || ""} />
          <p className="text-sm text-white/90">
            Activating: <strong>{validation.email}</strong> ({validation.role.replace("_", " ")})
          </p>
          <label className="block text-sm font-semibold">
            Full name
            <input
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password (12+ characters)
            <input
              type="password"
              name="password"
              required
              minLength={12}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            />
          </label>
          <label className="block text-sm font-semibold">
            Confirm password
            <input
              type="password"
              name="confirm"
              required
              minLength={12}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            />
          </label>
          <button type="submit" className="btn btn-gold w-full uppercase tracking-wide">
            Activate account
          </button>
        </form>
      )}
    </div>
  );
}
