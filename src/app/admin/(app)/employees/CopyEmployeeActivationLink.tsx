"use client";

import { useState } from "react";

/**
 * The activation URL is a one-time credential. Avoid rendering its token in
 * the visible page or copying it until an administrator explicitly requests it.
 */
export function CopyEmployeeActivationLink({ activationUrl }: { activationUrl: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyLink() {
    try {
      // Clipboard access requires HTTPS and an explicit click.
      await navigator.clipboard.writeText(activationUrl);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="mt-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-green-900">
        Activation link
      </span>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 rounded-lg border border-green-300 bg-white px-3 py-2 text-xs text-[var(--midnight)]">
          Secure activation link — hidden for privacy
        </span>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border border-[var(--royal)] bg-[var(--royal)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Copy employee activation link"
        >
          {status === "copied" ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-1 text-xs text-green-900">
        {status === "copied"
          ? "Link copied. Share it privately with this caregiver, then clear your clipboard when finished."
          : status === "failed"
            ? "Unable to copy automatically. Check browser clipboard permission and try again."
            : "The private link is only shown on this page once. Do not share it in public chats or screenshots."}
      </p>
    </div>
  );
}
