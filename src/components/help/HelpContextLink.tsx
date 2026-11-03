"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleHelp, X } from "lucide-react";
import { HelpMarkdown } from "./HelpMarkdown";

type HelpDrawerArticle = {
  slug: string;
  title: string;
  content: string;
  basePath: string;
};

export function HelpContextLink({
  label = "Help",
  article,
}: {
  label?: string;
  article?: HelpDrawerArticle | null;
}) {
  const [open, setOpen] = useState(false);
  const loaded = article ?? null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--royal)] hover:bg-[var(--cream)]"
        aria-label={`Open help: ${label}`}
      >
        <CircleHelp className="h-4 w-4" aria-hidden />
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="dialog" aria-modal="true" aria-label="Context help">
          <button type="button" className="flex-1" aria-label="Close help panel" onClick={() => setOpen(false)} />
          <div className="flex h-full w-full max-w-lg flex-col border-l border-line bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-display text-lg text-[var(--midnight)]">{loaded?.title ?? label}</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-[var(--cream)]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loaded ? (
                <>
                  <HelpMarkdown content={loaded.content} />
                  <Link
                    href={`${loaded.basePath}/${loaded.slug}`}
                    className="mt-6 inline-block text-sm font-semibold text-[var(--royal)]"
                    onClick={() => setOpen(false)}
                  >
                    Open full article →
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted">
                  Open the{" "}
                  <Link href={label === "Help" ? "/admin/help" : "/employee/help"} className="text-[var(--royal)] underline">
                    Help Center
                  </Link>{" "}
                  for full guides.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
