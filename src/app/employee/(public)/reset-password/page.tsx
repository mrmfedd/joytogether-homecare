import Link from "next/link";
import { resetEmployeePasswordAction } from "../password-actions";

export default async function EmployeeResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl">Choose a new password</h1>
      {error ? <p className="mt-4 text-sm text-red-200">Could not reset password. Request a new link.</p> : null}
      <form action={resetEmployeePasswordAction} className="mt-8 space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
        <input type="hidden" name="token" value={token || ""} />
        <label className="block text-sm font-semibold">
          New password
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
          Update password
        </button>
      </form>
      <Link href="/employee/login" className="mt-4 text-center text-sm text-sky-200 hover:underline">
        Sign in
      </Link>
    </div>
  );
}
