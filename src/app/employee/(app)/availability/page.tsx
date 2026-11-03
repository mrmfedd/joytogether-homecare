import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { prisma } from "@/lib/prisma";
import { addUnavailableDateAction, createAvailabilityAction, deleteAvailabilityAction } from "./actions";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minutesLabel(m: number | null) {
  if (m == null) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}:${min.toString().padStart(2, "0")}`;
}

export default async function EmployeeAvailabilityPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const rows = await prisma.employeeAvailability.findMany({
    where: { profileId: profile.id },
    orderBy: [{ dayOfWeek: "asc" }, { unavailableDate: "asc" }],
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-[var(--midnight)]">Availability</h1>
      <p className="mt-1 text-sm text-muted">Weekly hours and one-off unavailable dates.</p>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Weekly preference</h2>
        <form action={createAvailabilityAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Day
            <select name="dayOfWeek" required className="mt-1 w-full rounded-xl border border-line px-3 py-2">
              {days.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Start (minutes from midnight)
            <input name="startMinutes" type="number" min={0} max={1439} defaultValue={480} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            End (minutes)
            <input name="endMinutes" type="number" min={0} max={1440} defaultValue={1020} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm sm:col-span-2">
            Notes
            <input name="notes" className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <button type="submit" className="btn btn-purple px-4 py-2 text-sm sm:col-span-2">
            Add weekly block
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold">Unavailable date</h2>
        <form action={addUnavailableDateAction} className="mt-4 flex flex-wrap gap-3">
          <input name="unavailableDate" type="date" required className="rounded-xl border border-line px-3 py-2 text-sm" />
          <input name="notes" placeholder="Optional note" className="flex-1 rounded-xl border border-line px-3 py-2 text-sm" />
          <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
            Add
          </button>
        </form>
      </section>

      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-4 text-sm">
            <div>
              {row.unavailableDate ? (
                <p className="font-semibold">Unavailable {row.unavailableDate.toLocaleDateString()}</p>
              ) : (
                <p className="font-semibold">
                  {row.dayOfWeek != null ? days[row.dayOfWeek] : "Weekly"} · {minutesLabel(row.startMinutes)} –{" "}
                  {minutesLabel(row.endMinutes)}
                </p>
              )}
              {row.notes ? <p className="text-muted">{row.notes}</p> : null}
            </div>
            <form action={deleteAvailabilityAction}>
              <input type="hidden" name="id" value={row.id} />
              <button type="submit" className="text-xs font-semibold text-red-700">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="mt-4 text-sm text-muted">No availability saved yet.</p> : null}
    </div>
  );
}
