"use client";

import { useState, useTransition } from "react";
import QRCode from "qrcode";
import { enableEmployeeMfaAction, startEmployeeMfaSetupAction } from "./actions";
import { mfaOtpAuthUrl } from "@/lib/mfa";

export function EmployeeMfaSetupPanel({ email, mfaEnabled }: { email: string; mfaEnabled: boolean }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function beginSetup() {
    startTransition(async () => {
      const res = await startEmployeeMfaSetupAction();
      if (res.ok && res.secret) {
        setSecret(res.secret);
        const url = mfaOtpAuthUrl(email, res.secret);
        setQr(await QRCode.toDataURL(url));
      }
    });
  }

  if (mfaEnabled) {
    return <p className="text-sm text-[var(--joy-green)]">MFA is enabled on your account.</p>;
  }

  return (
    <div className="space-y-4">
      {!secret ? (
        <button type="button" onClick={beginSetup} disabled={pending} className="btn btn-purple px-4 py-2 text-sm">
          {pending ? "Preparing…" : "Set up authenticator MFA"}
        </button>
      ) : (
        <form action={enableEmployeeMfaAction} className="space-y-3">
          <input type="hidden" name="secret" value={secret} />
          {qr ? <img src={qr} alt="MFA QR code" className="h-40 w-40 rounded-lg border border-line bg-white p-2" /> : null}
          <p className="text-xs text-muted">Scan in your authenticator app, then enter the 6-digit code.</p>
          <input name="code" required inputMode="numeric" className="rounded-xl border border-line px-3 py-2 text-sm" />
          <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
            Enable MFA
          </button>
        </form>
      )}
    </div>
  );
}
