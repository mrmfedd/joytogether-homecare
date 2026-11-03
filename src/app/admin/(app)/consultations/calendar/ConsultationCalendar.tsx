"use client";

import Link from "next/link";
import { useMemo } from "react";

type CalConsultation = {
  id: string;
  status: string;
  scheduledAt: string;
  leadName: string;
  leadId: string;
  assignee: string;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function ConsultationCalendar({
  month,
  consultations,
  listHref,
}: {
  month: string;
  consultations: CalConsultation[];
  listHref: string;
}) {
  const anchor = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return startOfMonth(new Date(y, (m || 1) - 1, 1));
  }, [month]);

  const totalDays = daysInMonth(anchor);
  const startPad = anchor.getDay();
  const byDay = useMemo(() => {
    const map = new Map<number, CalConsultation[]>();
    for (const c of consultations) {
      const d = new Date(c.scheduledAt);
      if (d.getMonth() !== anchor.getMonth() || d.getFullYear() !== anchor.getFullYear()) continue;
      const day = d.getDate();
      const list = map.get(day) || [];
      list.push(c);
      map.set(day, list);
    }
    return map;
  }, [consultations, anchor]);

  const prev = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
  const next = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Link href={`?month=${fmt(prev)}`} className="rounded-xl border border-line px-3 py-1 text-sm font-semibold">
            ← Prev
          </Link>
          <Link href={`?month=${fmt(next)}`} className="rounded-xl border border-line px-3 py-1 text-sm font-semibold">
            Next →
          </Link>
        </div>
        <p className="font-display text-xl text-[var(--midnight)]">
          {anchor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </p>
        <Link href={listHref} className="text-sm font-bold text-[var(--royal)] hover:underline">
          List view
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) =>
          day === null ? (
            <div key={`pad-${idx}`} className="min-h-[88px] rounded-lg bg-[var(--cream)]/30" />
          ) : (
            <div key={day} className="min-h-[88px] rounded-lg border border-line bg-white p-1 text-left">
              <span className="text-xs font-bold text-muted">{day}</span>
              <ul className="mt-1 space-y-0.5">
                {(byDay.get(day) || []).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/consultations?highlight=${c.id}`}
                      className="block truncate rounded bg-[var(--sky)] px-1 py-0.5 text-[10px] font-semibold text-[var(--midnight)] hover:bg-[var(--purple-100)]"
                      title={`${c.leadName} · ${c.status}`}
                    >
                      {new Date(c.scheduledAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}{" "}
                      {c.leadName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
