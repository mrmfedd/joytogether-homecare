"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";

export function PasskeySignInButton({
  portal,
  email,
  callbackUrl,
}: {
  portal: "admin" | "employee";
  email?: string;
  callbackUrl: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithPasskey() {
    setLoading(true);
    setError("");
    try {
      if (!window.PublicKeyCredential) {
        setError("This browser does not support passkeys. Use your password.");
        setLoading(false);
        return;
      }

      const optionsRes = await fetch("/api/auth/passkey/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email?.trim() || undefined, portal }),
      });
      const optionsJson = await optionsRes.json();
      if (!optionsRes.ok) {
        setError(optionsJson.error ?? "Passkey sign-in unavailable.");
        setLoading(false);
        return;
      }

      const assertion = await startAuthentication(optionsJson.options);
      const verifyRes = await fetch("/api/auth/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal, response: assertion }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyJson.error ?? "Passkey verification failed.");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        passkeyTicket: verifyJson.ticket,
        portal,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError("Session could not be started. Try password sign-in.");
        setLoading(false);
        return;
      }

      let session = await getSession();
      for (let i = 0; i < 12 && !session?.user?.role; i += 1) {
        await new Promise((r) => setTimeout(r, 150));
        session = await getSession();
      }
      window.location.href = callbackUrl;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "cancelled";
      if (!msg.toLowerCase().includes("cancel")) {
        setError("Passkey sign-in did not complete. Try again or use your password.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void signInWithPasskey()}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--joy-green)] bg-white px-4 py-3 text-base font-bold text-[var(--midnight)] shadow-sm disabled:opacity-60"
      >
        {loading ? "Waiting for device…" : "Sign in with Face ID, Touch ID, or Passkey"}
      </button>
      <p className="text-center text-xs text-muted">
        Uses your device PIN or biometrics. Your fingerprint or face never leaves your device.
      </p>
      {error ? <p className="text-center text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}