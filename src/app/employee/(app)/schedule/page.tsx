import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { formatShiftRange } from "@/lib/workforce/queries";
import { prisma } from "@/lib/prisma";
import { confirmShiftAssignmentAction, declineShiftAssignmentAction } from "./actions";

export default async function EmployeeSchedulePage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const now = new Date();
  const assignments = await prisma.shiftAssignment.findMany({
    where: {
      profileId: profile.id,
      shift: { status: { in: ["PUBLISHED", "COMPLETED"] }, endsAt: { gte: new Date(now.getTime() - 14 * 86400000) } },
    },
    include: { shift: true },
    orderBy: { shift: { startsAt: "asc" } },
    take: 40,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">My schedule</h1>
      <p className="mt-1 text-sm text-muted">Confirm or decline assigned shifts.</p>

      <ul className="mt-6 space-y-4">
        {assignments.map((row) => (
          <li key={row.id} className="rounded-2xl border border-line bg-white p-4">
            <p className="font-semibold">{row.shift.title || row.shift.serviceCategory}</p>
            <p className="text-sm text-muted">{formatShiftRange(row.shift.startsAt, row.shift.endsAt, profile.timezone)}</p>
            {row.shift.workLocationLabel ? <p className="mt-1 text-sm">{row.shift.workLocationLabel}</p> : null}
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--royal)]">{row.confirmationStatus}</p>
            {row.confirmationStatus === "PENDING" && row.shift.status === "PUBLISHED" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={confirmShiftAssignmentAction}>
                  <input type="hidden" name="assignmentId" value={row.id} />
                  <button type="submit" className="btn btn-purple px-3 py-1.5 text-xs">
                    Confirm
                  </button>
                </form>
                <form action={declineShiftAssignmentAction}>
                  <input type="hidden" name="assignmentId" value={row.id} />
                  <button type="submit" className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold">
                    Decline
                  </button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {assignments.length === 0 ? <p className="mt-6 text-sm text-muted">No shifts on your schedule yet.</p> : null}
    </div>
  );
}
