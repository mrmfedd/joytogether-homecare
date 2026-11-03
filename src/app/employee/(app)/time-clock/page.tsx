import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { isTimeClockEnabled } from "@/lib/workforce/settings";
import { prisma } from "@/lib/prisma";
import { clockInAction, clockOutAction } from "./actions";

export default async function EmployeeTimeClockPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const enabled = await isTimeClockEnabled();
  if (!enabled) {
    return (
      <div>
        <h1 className="font-display text-3xl text-[var(--midnight)]">Time clock</h1>
        <p className="mt-4 rounded-xl border border-line bg-white p-5 text-sm text-muted">
          Time clock is not enabled for your organization. Contact your supervisor if you need to report hours.
        </p>
      </div>
    );
  }

  const [openEntry, recent, todayAssignments] = await Promise.all([
    prisma.timeEntry.findFirst({
      where: { profileId: profile.id, status: "OPEN" },
      orderBy: { clockInAt: "desc" },
    }),
    prisma.timeEntry.findMany({
      where: { profileId: profile.id },
      orderBy: { clockInAt: "desc" },
      take: 10,
    }),
    prisma.shiftAssignment.findMany({
      where: {
        profileId: profile.id,
        shift: { status: "PUBLISHED", startsAt: { lte: new Date(Date.now() + 86400000) }, endsAt: { gte: new Date() } },
      },
      include: { shift: true },
    }),
  ]);

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-[var(--midnight)]">Time clock</h1>
      {openEntry ? (
        <div className="mt-6 rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-5">
          <p className="font-semibold">Clocked in since {openEntry.clockInAt.toLocaleString()}</p>
          <form action={clockOutAction} className="mt-4">
            <button type="submit" className="btn btn-gold w-full py-3">
              Clock out
            </button>
          </form>
        </div>
      ) : (
        <form action={clockInAction} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-5">
          <label className="block text-sm">
            Link to shift (optional)
            <select name="shiftAssignmentId" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
              <option value="">General / unassigned</option>
              {todayAssignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.shift.title || a.shift.serviceCategory} — {a.shift.startsAt.toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-purple w-full py-3">
            Clock in
          </button>
        </form>
      )}

      <h2 className="mt-8 font-semibold">Recent entries</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {recent.map((e) => (
          <li key={e.id} className="rounded-xl border border-line bg-white px-4 py-3">
            {e.clockInAt.toLocaleString()} – {e.clockOutAt ? e.clockOutAt.toLocaleString() : "Open"} ({e.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
