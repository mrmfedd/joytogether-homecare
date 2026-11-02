import Link from "next/link";
import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { formatShiftRange, getEmployeeDashboardData } from "@/lib/workforce/queries";

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="font-display mt-1 text-2xl text-[var(--royal)]">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function EmployeeDashboardPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const data = await getEmployeeDashboardData(profile.id);
  const tz = profile.timezone;

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Your upcoming work at a glance.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Confirm shifts" value={data.pendingConfirmations} href="/employee/schedule" />
        <Stat label="Open shifts" value={data.openOffersCount} href="/employee/open-shifts" />
        <Stat label="Unread notices" value={data.unreadNotices} href="/employee/notices" />
        <Stat label="Time off pending" value={data.pendingTimeOff} href="/employee/time-off" />
      </div>

      {data.openTimeEntry ? (
        <p className="mt-6 rounded-xl border border-[var(--gold)]/50 bg-[var(--gold)]/10 p-4 text-sm font-semibold">
          You are clocked in since {data.openTimeEntry.clockInAt.toLocaleString()}.{" "}
          <Link href="/employee/time-clock" className="text-[var(--royal)] underline">
            Open time clock
          </Link>
        </p>
      ) : null}

      <section className="mt-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl">Upcoming shifts</h2>
        {data.upcomingAssignments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No published shifts in the next 7 days.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.upcomingAssignments.map((row) => (
              <li key={row.id} className="rounded-xl border border-line px-4 py-3 text-sm">
                <p className="font-semibold">{row.shift.title || row.shift.serviceCategory}</p>
                <p className="text-muted">{formatShiftRange(row.shift.startsAt, row.shift.endsAt, tz)}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[var(--royal)]">
                  {row.confirmationStatus === "PENDING" ? "Confirmation needed" : row.confirmationStatus}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link href="/employee/schedule" className="mt-4 inline-block text-sm font-semibold text-[var(--royal)]">
          View full schedule →
        </Link>
      </section>
    </div>
  );
}
