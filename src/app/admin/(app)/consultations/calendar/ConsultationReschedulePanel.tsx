import { updateConsultationAction } from "../actions";
import type { ConsultationStatus } from "@/generated/prisma";

type Row = {
  id: string;
  status: ConsultationStatus;
  scheduledAt: Date | null;
  assignedToId: string | null;
  lead: { fullName: string };
};

export function ConsultationReschedulePanel({
  consultations,
  assignees,
}: {
  consultations: Row[];
  assignees: { id: string; name: string | null; email: string }[];
}) {
  const scheduled = consultations.filter((c) => c.scheduledAt);
  if (scheduled.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-line bg-white p-5">
      <h2 className="font-semibold">Reschedule & update status</h2>
      <p className="mt-1 text-sm text-muted">Changes run conflict checks for the assigned coordinator.</p>
      <ul className="mt-4 space-y-4">
        {scheduled.map((c) => {
          const scheduledValue = c.scheduledAt
            ? new Date(c.scheduledAt.getTime() - c.scheduledAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
            : "";
          return (
            <li key={c.id} className="rounded-xl border border-line p-4 text-sm">
              <p className="font-semibold">{c.lead.fullName}</p>
              <form action={updateConsultationAction} className="mt-3 grid gap-2 sm:grid-cols-3">
                <input type="hidden" name="id" value={c.id} />
                <label>
                  Status
                  <select name="status" defaultValue={c.status} className="mt-1 w-full rounded-lg border border-line px-2 py-1">
                    {(["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW"] as ConsultationStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Scheduled
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    defaultValue={scheduledValue}
                    className="mt-1 w-full rounded-lg border border-line px-2 py-1"
                  />
                </label>
                <label>
                  Assignee
                  <select
                    name="assigneeId"
                    defaultValue={c.assignedToId || assignees[0]?.id}
                    className="mt-1 w-full rounded-lg border border-line px-2 py-1"
                  >
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name || a.email}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="btn btn-purple w-fit px-3 py-1.5 text-xs sm:col-span-3">
                  Save changes
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
