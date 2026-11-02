import { acceptInviteAction } from "./actions";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl">Accept admin invitation</h1>
      <p className="mt-2 text-sm text-white/80">Create your password to activate your account.</p>
      <form action={acceptInviteAction} className="mt-8 space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
        <input type="hidden" name="token" value={token || ""} />
        <label className="block text-sm font-semibold">
          Full name
          <input name="name" required className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]" />
        </label>
        <label className="block text-sm font-semibold">
          Password (12+ characters)
          <input type="password" name="password" required minLength={12} className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]" />
        </label>
        <label className="block text-sm font-semibold">
          Confirm password
          <input type="password" name="confirm" required minLength={12} className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]" />
        </label>
        <button type="submit" className="btn btn-gold w-full uppercase tracking-wide">
          Activate account
        </button>
      </form>
    </div>
  );
}
