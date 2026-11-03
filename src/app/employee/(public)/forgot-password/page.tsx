import Link from "next/link";
import { requestEmployeePasswordResetAction } from "../password-actions";

export default function EmployeeForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl">Reset employee password</h1>
      <p className="mt-2 text-sm text-white/80">We will email a one-time link if an active employee account exists.</p>
      <form action={requestEmployeePasswordResetAction} className="mt-8 space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
        <label className="block text-sm font-semibold">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
          />
        </label>
        <button type="submit" className="btn btn-gold w-full uppercase tracking-wide">
          Send reset link
        </button>
      </form>
      <Link href="/employee/login" className="mt-4 text-center text-sm text-sky-200 hover:underline">
        Back to login
      </Link>
    </div>
  );
}
