"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function EmployeeLoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/employee";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      mfaCode,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials or inactive employee account.");
      return;
    }
    const session = await getSession();
    if (session?.user?.role !== "EMPLOYEE") {
      window.location.href = "/admin";
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl">Employee Portal</h1>
      <p className="mt-2 text-sm text-white/80">Sign in to view your schedule and workplace notices.</p>
      {params.get("accepted") === "1" ? (
        <p className="mt-4 rounded-xl border border-[var(--gold)]/40 bg-white/10 p-3 text-sm">Account activated — sign in below.</p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            autoComplete="username"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            autoComplete="current-password"
          />
        </label>
        <label className="block text-sm font-semibold">
          Authenticator code (if MFA enabled)
          <input
            type="text"
            inputMode="numeric"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-[var(--midnight)]"
            autoComplete="one-time-code"
          />
        </label>
        {error ? <p className="text-sm font-semibold text-red-200">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-gold w-full uppercase tracking-wide disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Link href="/employee/forgot-password" className="mt-4 block text-center text-sm text-sky-200 hover:underline">
        Forgot password?
      </Link>
      <p className="mt-6 text-xs text-white/70">Access is by invitation only. Patient information is not available here.</p>
    </div>
  );
}
