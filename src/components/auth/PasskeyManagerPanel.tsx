"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PasskeyRow = {
  id: string;
  friendlyName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  backedUp: boolean;
};

export function PasskeyManagerPanel({ passkeys }: { passkeys: PasskeyRow[] }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [reauthed, setReauthed] = useState(false);
  const [message, setMessage] = useState("");
  const [friendlyName, setFriendlyName] = useState("My device");

  async function reauth() {
    setMessage("");
    const res = await fetch("/api/auth/passkey/reauth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, mfaCode: mfaCode || undefined }),
    });
    if (!res.ok) {
      setMessage("Reauthentication failed. Enter your current password (and authenticator code if enabled).");
      return;
    }
    setReauthed(true);
    setMessage("Verified. You can add or remove passkeys for the next few minutes.");
  }

  async function addPasskey() {
    setMessage("");
    const optionsRes = await fetch("/api/auth/passkey/register/options", { method: "POST" });
    const optionsJson = await optionsRes.json();
    if (!optionsRes.ok) {
      setMessage(optionsJson.error === "reauth_required" ? "Confirm your password first." : "Could not start registration.");
      return;
    }
    try {
      const attestation = await startRegistration({ optionsJSON: optionsJson.options });
      const verifyRes = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: attestation, friendlyName }),
      });
      if (!verifyRes.ok) {
        setMessage("Passkey registration failed.");
        return;
      }
      setMessage("Passkey added.");
      router.refresh();
    } catch {
      setMessage("Registration cancelled or failed.");
    }
  }

  async function removePasskey(id: string) {
    const res = await fetch("/api/auth/passkey/" + id, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Could not remove passkey. Confirm reauthentication.");
      return;
    }
    setMessage("Passkey removed.");
    router.refresh();
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-6">
      <h2 className="font-display text-xl text-[var(--midnight)]">Passkeys</h2>
      <p className="mt-2 text-sm text-muted">
        Sign in with Face ID, Touch ID, Windows Hello, or device PIN. You may register more than one device (for example
        a phone and a backup iPad). JoyTogether stores only a public key — never your biometric data.
      </p>

      <div className="mt-4 space-y-2">
        {passkeys.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm">
            <span>
              {p.friendlyName ?? "Passkey"} · added {new Date(p.createdAt).toLocaleDateString()}
              {p.backedUp ? " · synced backup" : ""}
            </span>
            {reauthed ? (
              <button
                type="button"
                onClick={() => void removePasskey(p.id)}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-900"
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
        {passkeys.length === 0 ? <p className="text-sm text-muted">No passkeys yet. Add one after confirming your password.</p> : null}
      </div>

      {!reauthed ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            Confirm password before adding or removing passkeys
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              autoComplete="current-password"
            />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Authenticator code (if you use one)
            <input
              type="text"
              inputMode="numeric"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
            />
          </label>
          <button type="button" onClick={() => void reauth()} className="btn btn-purple w-fit px-4 py-2 text-sm sm:col-span-2">
            Verify identity
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <label className="block text-sm font-semibold">
            Device label
            <input
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
            />
          </label>
          <button type="button" onClick={() => void addPasskey()} className="btn btn-gold px-4 py-2 text-sm font-semibold">
            Add passkey on this device
          </button>
        </div>
      )}

      {message ? <p className="mt-4 text-sm font-semibold text-[var(--royal)]">{message}</p> : null}

      <p className="mt-4 text-xs text-muted">
        Lost your device? Use password sign-in, then remove the old passkey. Administrators can start assisted account recovery with audit logging and session revocation.
      </p>
    </section>
  );
}