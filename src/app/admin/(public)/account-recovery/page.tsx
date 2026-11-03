import { validateAdminRecoveryToken } from "@/lib/admin/account-recovery";
import { completeAdminAccountRecoveryAction } from "./actions";

const errorCopy: Record<string, string> = {
  missing: "This recovery link is incomplete.",
  invalid: "This recovery link is not valid.",
  expired: "This recovery link has expired. Request a new recovery from your operator.",
  used: "This recovery link was already used.",
  inactive: "This account is inactive.",
  password: "Passwords must match and be at least 12 characters.",
};

export default async function AdminAccountRecoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const validation = token ? await validateAdminRecoveryToken(token) : { ok: false as const, reason: "missing" as const };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl">Administrator account recovery</h1>
      <p className="mt-2 text-sm text-white/80">
        Set a new password. Your previous MFA enrollment will be cleared; you must enroll a new authenticator after
        sign-in.
      </p>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-300/40 bg-red-950/40 p-4 text-sm text-red-100">
          {errorCopy[error] || "Unable to complete recovery."}
        </p>
      ) : null}

      {!validation.ok ? (
        <p className="mt-6 text-sm text-white/80">{errorCopy[validation.reason]}</p>
      ) : (
        <form action={completeAdminAccountRecoveryAction} className="mt-8 space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
          <input type="hidden" name="token" value={token || ""} />
          <p className="text-sm text-white/90">
            Recovering: <strong>{validation.email}</strong> ({validation.role.replace("_", " ")})
          </p>
          <label className="block text-sm font-semibold">
            New password (12+ characters)
            <input
              type="password"
              name="password"
              required
              minLength={12}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            />
          </label>
          <label className="block text-sm font-semibold">
            Confirm new password
            <input
              type="password"
              name="confirm"
              required
              minLength={12}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            />
          </label>
          <button type="submit" className="btn btn-gold w-full uppercase tracking-wide">
            Complete recovery
          </button>
        </form>
      )}
    </div>
  );
}
