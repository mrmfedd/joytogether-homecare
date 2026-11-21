import type { TimelineEntry } from "@/lib/patient/timeline";

const kindColors: Record<TimelineEntry["kind"], string> = {
  assignment: "border-l-[var(--royal)]",
  visit: "border-l-emerald-500",
  note: "border-l-sky-500",
  alert: "border-l-amber-500",
  audit: "border-l-slate-400",
  instruction: "border-l-violet-500",
};

export function PatientTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted">No activity recorded yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={`rounded-xl border border-line border-l-4 bg-white px-4 py-3 ${kindColors[entry.kind]}`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            {entry.kind.replace("_", " ")} · {entry.at.toLocaleString()}
          </p>
          <p className="mt-1 font-semibold text-[var(--midnight)]">{entry.title}</p>
          {entry.summary ? <p className="mt-1 text-sm text-muted">{entry.summary}</p> : null}
        </li>
      ))}
    </ol>
  );
}