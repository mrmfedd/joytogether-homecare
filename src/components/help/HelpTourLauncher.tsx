"use client";

import { useEffect, useState } from "react";
import type { WalkthroughDefinition } from "@/lib/help/walkthroughs";
import { dismissWalkthrough, walkthroughDismissed } from "@/lib/help/walkthroughs";

export function HelpTourLauncher({
  tours,
  autoStartId,
}: {
  tours: WalkthroughDefinition[];
  autoStartId?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const active = tours.find((t) => t.id === activeId) ?? null;
  const step = active?.steps[stepIndex];

  useEffect(() => {
    if (!autoStartId || walkthroughDismissed(autoStartId)) return;
    const t = tours.find((x) => x.id === autoStartId);
    if (t) setActiveId(t.id);
  }, [autoStartId, tours]);

  if (!active || !step) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {tours.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveId(t.id);
              setStepIndex(0);
            }}
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-[var(--royal)] hover:bg-[var(--cream)]"
          >
            Start: {t.title}
          </button>
        ))}
      </div>
    );
  }

  const finish = (dismiss: boolean) => {
    if (dismiss) dismissWalkthrough(active.id);
    setActiveId(null);
    setStepIndex(0);
  };

  const isLast = stepIndex >= active.steps.length - 1;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 max-w-sm rounded-2xl border border-line bg-white p-4 shadow-lg"
      role="region"
      aria-label={`Guided tour: ${active.title}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-muted">
        Step {stepIndex + 1} of {active.steps.length}
      </p>
      <p className="mt-1 font-display text-lg text-[var(--midnight)]">{step.title}</p>
      <p className="mt-2 text-sm text-muted">{step.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="text-xs font-semibold text-muted" onClick={() => finish(true)}>
          Skip tour
        </button>
        {!isLast ? (
          <button
            type="button"
            className="btn btn-purple px-3 py-1.5 text-xs"
            onClick={() => setStepIndex((i) => i + 1)}
          >
            Next
          </button>
        ) : (
          <button type="button" className="btn btn-gold px-3 py-1.5 text-xs" onClick={() => finish(true)}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}
