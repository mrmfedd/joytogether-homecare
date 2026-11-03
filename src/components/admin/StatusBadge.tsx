import type { PublicationStatus } from "@/generated/prisma";

const styles: Record<PublicationStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-amber-100 text-amber-900",
};

export function StatusBadge({ status }: { status: PublicationStatus | string }) {
  const cls = styles[status as PublicationStatus] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}
