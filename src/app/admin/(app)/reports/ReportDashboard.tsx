"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categories = [
  { id: "leads", label: "Leads" },
  { id: "consultations", label: "Consultations" },
  { id: "private-duty", label: "Private duty" },
  { id: "employees", label: "Employees" },
  { id: "shifts", label: "Shifts" },
  { id: "time-off", label: "Time off" },
  { id: "timesheets", label: "Timesheets" },
] as const;

export function ReportCategoryNav({ active }: { active: string }) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  return (
    <nav className="flex flex-wrap gap-2 print:hidden">
      {categories.map((c) => {
        const q = new URLSearchParams();
        q.set("category", c.id);
        if (from) q.set("from", from);
        if (to) q.set("to", to);
        const href = `/admin/reports?${q.toString()}`;
        return (
          <Link
            key={c.id}
            href={href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              active === c.id
                ? "bg-[var(--royal)] text-white"
                : "border border-line bg-white text-[var(--midnight)] hover:border-[var(--joy-green)]"
            }`}
          >
            {c.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ReportMetricGrid({ items }: { items: { label: string; value: string | number }[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-[var(--cream)]/50 p-6 text-sm text-muted">
        No data available for the selected reporting period.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">{item.label}</p>
          <p className="font-display mt-2 text-3xl text-[var(--midnight)]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ReportExportBar({
  category,
  from,
  to,
}: {
  category: string;
  from: string;
  to: string;
}) {
  const exportLink = (format: string, label: string) => {
    const q = new URLSearchParams({ category, format });
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    return (
      <a
        key={format}
        href={`/api/admin/reports/export?${q.toString()}`}
        className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-[var(--royal)]"
      >
        {label}
      </a>
    );
  };
  return (
    <div className="mt-6 flex flex-wrap gap-3 print:hidden">
      <button type="button" onClick={() => window.print()} className="btn btn-gold px-4 py-2 text-sm">
        Print report
      </button>
      {exportLink("csv", "Download CSV")}
      {exportLink("xlsx", "Download Excel")}
      {exportLink("pdf", "Download PDF")}
    </div>
  );
}
