import { updateConsultationAction } from "./actions";
import type { ConsultationStatus } from "@/generated/prisma";

const statuses: ConsultationStatus[] = ["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW"];

export function ConsultationUpdateForm({
  id,
  status,
  scheduledAt,
  notes,
}: {
  id: string;
  status: ConsultationStatus;
  scheduledAt: Date | null;
  notes: string | null;
}) {
  const scheduledValue = scheduledAt
    ? new Date(scheduledAt.getTime() - scheduledAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : "";

  return (
    <form action={updateConsultationAction} className="mt-2 grid gap-2 rounded-xl bg-[var(--cream)] p-3 text-xs">
      <input type="hidden" name="id" value={id} />
      <label className="font-semibold">
        Status
        <select name="status" defaultValue={status} className="mt-1 w-full rounded-lg border border-line px-2 py-1">
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="font-semibold">
        Scheduled
        <input type="datetime-local" name="scheduledAt" defaultValue={scheduledValue} className="mt-1 w-full rounded-lg border border-line px-2 py-1" />
      </label>
      <label className="font-semibold">
        Internal notes
        <textarea name="notes" defaultValue={notes || ""} rows={2} className="mt-1 w-full rounded-lg border border-line px-2 py-1" />
      </label>
      <button type="submit" className="rounded-lg bg-[var(--royal)] px-3 py-1.5 font-bold text-white">
        Save
      </button>
    </form>
  );
}
