import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageScheduling } from "@/lib/workforce/permissions";
import { formatShiftRange } from "@/lib/workforce/queries";
import { prisma } from "@/lib/prisma";
import {
  assignEmployeeToShiftAction,
  cancelShiftAction,
  createShiftAction,
  moveShiftWeekAction,
  publishShiftAction,
  updateShiftAction,
} from "./actions";

function weekStart(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function AdminSchedulingPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) redirect("/admin");

  const params = await searchParams;
  const anchor = params.week ? new Date(params.week) : new Date();
  const start = weekStart(anchor);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const [shifts, employees] = await Promise.all([
    prisma.shift.findMany({
      where: { startsAt: { gte: start, lt: end }, status: { not: "CANCELED" } },
      include: {
        assignment: { include: { profile: { include: { user: { select: { name: true, email: true } } } } } },
      },
      orderBy: { startsAt: "asc" },
    }),
    prisma.employeeProfile.findMany({
      where: { employmentStatus: { in: ["ACTIVE", "ON_LEAVE"] } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const prevWeek = new Date(start);
  prevWeek.setDate(start.getDate() - 7);
  const nextWeek = new Date(start);
  nextWeek.setDate(start.getDate() + 7);

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Scheduling</h1>
      <p className="mt-1 text-sm text-muted">
        Week of {start.toLocaleDateString()} — create, assign, and publish shifts.
      </p>

      <div className="mt-4 flex gap-2 text-sm">
        <a href={`/admin/scheduling?week=${prevWeek.toISOString()}`} className="rounded-xl border border-line bg-white px-3 py-1.5 font-semibold">
          ← Previous
        </a>
        <a href={`/admin/scheduling?week=${nextWeek.toISOString()}`} className="rounded-xl border border-line bg-white px-3 py-1.5 font-semibold">
          Next →
        </a>
      </div>

      <form action={createShiftAction} className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">New shift (draft)</h2>
        <input name="title" placeholder="Title (optional)" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <input name="serviceCategory" placeholder="Service category" defaultValue="Private Duty" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <label className="text-sm">
          Starts
          <input name="startsAt" type="datetime-local" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Ends
          <input name="endsAt" type="datetime-local" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <input name="workLocationLabel" placeholder="Location label" className="sm:col-span-2 rounded-xl border border-line px-3 py-2 text-sm" />
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm sm:col-span-2">
          Create draft shift
        </button>
      </form>

      <ul className="mt-8 space-y-4">
        {shifts.map((shift) => (
          <li key={shift.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{shift.title || shift.serviceCategory}</p>
                <p className="text-sm text-muted">{formatShiftRange(shift.startsAt, shift.endsAt)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--royal)]">{shift.status}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {shift.status === "DRAFT" ? (
                  <form action={publishShiftAction}>
                    <input type="hidden" name="shiftId" value={shift.id} />
                    <button type="submit" className="btn btn-gold px-3 py-1.5 text-xs">
                      Publish
                    </button>
                  </form>
                ) : null}
                {shift.status !== "CANCELED" ? (
                  <form action={cancelShiftAction}>
                    <input type="hidden" name="shiftId" value={shift.id} />
                    <button type="submit" className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold">
                      Cancel
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--royal)]">Edit shift</summary>
              <form action={updateShiftAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                <input type="hidden" name="shiftId" value={shift.id} />
                <input name="title" defaultValue={shift.title || ""} className="rounded-xl border border-line px-3 py-2 text-sm" />
                <input name="serviceCategory" defaultValue={shift.serviceCategory} className="rounded-xl border border-line px-3 py-2 text-sm" />
                <input
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={shift.startsAt.toISOString().slice(0, 16)}
                  className="rounded-xl border border-line px-3 py-2 text-sm"
                />
                <input
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={shift.endsAt.toISOString().slice(0, 16)}
                  className="rounded-xl border border-line px-3 py-2 text-sm"
                />
                <input name="workLocationLabel" defaultValue={shift.workLocationLabel || ""} className="sm:col-span-2 rounded-xl border border-line px-3 py-2 text-sm" />
                <button type="submit" className="btn btn-purple px-3 py-1.5 text-xs sm:col-span-2">
                  Save changes
                </button>
              </form>
            </details>

            <form action={assignEmployeeToShiftAction} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="shiftId" value={shift.id} />
              <label className="text-sm">
                Assign employee
                <select name="profileId" defaultValue={shift.assignment?.profileId || ""} className="mt-1 block rounded-xl border border-line px-3 py-2">
                  <option value="">— Select —</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.user.name || e.user.email} ({e.classification.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-purple px-3 py-1.5 text-xs">
                Assign
              </button>
            </form>
            {shift.assignment ? (
              <p className="mt-2 text-sm text-muted">
                Assigned: {shift.assignment.profile.user.name || shift.assignment.profile.user.email} ·{" "}
                {shift.assignment.confirmationStatus}
              </p>
            ) : null}

            <form action={moveShiftWeekAction} className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
              <input type="hidden" name="shiftId" value={shift.id} />
              <label className="text-xs text-muted">
                Move to week starting
                <input name="targetWeekStart" type="date" className="mt-1 block rounded-xl border border-line px-2 py-1" />
              </label>
              <button type="submit" className="text-xs font-semibold text-[var(--royal)]">
                Move shift
              </button>
            </form>
          </li>
        ))}
      </ul>
      {shifts.length === 0 ? <p className="mt-6 text-sm text-muted">No shifts this week.</p> : null}
    </div>
  );
}
