"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { safePortalCallbackUrl } from "@/lib/auth/portal-callback";
import { PasskeySignInButton } from "@/components/auth/PasskeySignInButton";

export default function AdminLoginForm() {
  const params = useSearchParams();
  const callbackUrl = safePortalCallbackUrl(params.get("callbackUrl"), "admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      portal: "admin",
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError(
        "Sign-in failed. Use your administrator account here. Field staff must use Employee Login (/employee/login).",
      );
      return;
    }
    if (!res?.ok) {
      setError("Sign-in could not be completed. Try again.");
      return;
    }
    let session = await getSession();
    for (let i = 0; i < 12 && !session?.user?.role; i += 1) {
      await new Promise((r) => setTimeout(r, 150));
      session = await getSession();
    }
    if (session?.user?.role === "EMPLOYEE") {
      setError("This portal is for administrators only.");
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl">JoyTogether Admin</h1>
      <p className="mt-2 text-sm text-white/80">Secure sign-in for authorized staff only.</p>
      <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur">
        <PasskeySignInButton portal="admin" email={email} callbackUrl={callbackUrl} />
        <p className="my-4 text-center text-xs font-semibold uppercase tracking-wide text-white/80">Or sign in with password</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
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
        {error ? <p className="text-sm font-semibold text-red-200">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-gold w-full uppercase tracking-wide disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <a href="/admin/forgot-password" className="mt-4 block text-center text-sm text-sky-200 hover:underline">
        Forgot password?
      </a>
      <p className="mt-6 text-xs text-white/70">
        No public registration. Administrators are invited by JoyTogether leadership.
      </p>
    </div>
  );
}
