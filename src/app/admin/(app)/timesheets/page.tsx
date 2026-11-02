import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canReviewTimesheets } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { approveTimesheetCorrectionAction } from "./actions";

export default async function AdminTimesheetsPage() {
  const user = await requireAdminSession();
  if (!user || !canReviewTimesheets(user.role)) redirect("/admin");

  const [entries, corrections] = await Promise.all([
    prisma.timeEntry.findMany({
      include: { profile: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { clockInAt: "desc" },
      take: 40,
    }),
    prisma.timesheetCorrection.findMany({
      where: { status: "PENDING" },
      include: {
        timeEntry: { include: { profile: { include: { user: { select: { name: true, email: true } } } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Timesheets</h1>
      <p className="mt-1 text-sm text-muted">Review time entries and correction requests.</p>

      {corrections.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-semibold">Pending corrections</h2>
          <ul className="mt-3 space-y-3">
            {corrections.map((c) => (
              <li key={c.id} className="rounded-2xl border border-line bg-white p-4 text-sm">
                <p className="font-semibold">{c.timeEntry.profile.user.name || c.timeEntry.profile.user.email}</p>
                <p className="text-muted">{c.reason}</p>
                <p className="mt-1">
                  Requested: {c.requestedInAt?.toLocaleString() || "—"} → {c.requestedOutAt?.toLocaleString() || "—"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={approveTimesheetCorrectionAction}>
                    <input type="hidden" name="correctionId" value={c.id} />
                    <input type="hidden" name="approve" value="1" />
                    <button type="submit" className="btn btn-purple px-3 py-1 text-xs">
                      Approve
                    </button>
                  </form>
                  <form action={approveTimesheetCorrectionAction} className="flex gap-2">
                    <input type="hidden" name="correctionId" value={c.id} />
                    <input type="hidden" name="approve" value="0" />
                    <input name="reviewNote" placeholder="Rejection note" className="rounded-xl border border-line px-2 py-1 text-xs" />
                    <button type="submit" className="rounded-xl border border-line px-3 py-1 text-xs font-semibold">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-semibold">Recent time entries</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Clock in</th>
                <th className="px-4 py-3">Clock out</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-line">
                  <td className="px-4 py-3">{e.profile.user.name || e.profile.user.email}</td>
                  <td className="px-4 py-3">{e.clockInAt.toLocaleString()}</td>
                  <td className="px-4 py-3">{e.clockOutAt?.toLocaleString() || "—"}</td>
                  <td className="px-4 py-3">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
