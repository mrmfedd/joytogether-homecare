"use client";

import { useState } from "react";
import { archiveLeadAction } from "@/app/admin/(app)/leads/actions";

export function ArchiveLeadForm({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-800"
      >
        Archive lead
      </button>
    );
  }
  return (
    <form action={archiveLeadAction} className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-900">Archive sets status to CLOSED. Type ARCHIVE to confirm.</p>
      <input type="hidden" name="leadId" value={leadId} />
      <input name="confirm" required placeholder="ARCHIVE" className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm" />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-bold text-white">
          Confirm archive
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}
