import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canReviewTimesheets } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { parseReportDateRange } from "@/lib/admin/reporting/date-range";
import { approveTimesheetCorrectionAction } from "./actions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";

function hoursBetween(clockIn: Date, clockOut: Date | null) {
  if (!clockOut) return null;
  const h = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
  return Math.round(h * 100) / 100;
}

export default async function AdminTimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; employee?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canReviewTimesheets(user.role)) redirect("/admin");

  const params = await searchParams;
  const range = parseReportDateRange({ from: params.from, to: params.to });
  const employeeQ = params.employee?.trim();

  const entryWhere = {
    clockInAt: { gte: range.from, lte: range.to },
    ...(employeeQ
      ? {
          profile: {
            user: {
              OR: [
                { name: { contains: employeeQ, mode: "insensitive" as const } },
                { email: { contains: employeeQ, mode: "insensitive" as const } },
              ],
            },
          },
        }
      : {}),
  };

  const [entries, corrections, employees] = await Promise.all([
    prisma.timeEntry.findMany({
      where: entryWhere,
      include: { profile: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { clockInAt: "desc" },
      take: 100,
    }),
    prisma.timesheetCorrection.findMany({
      where: { status: "PENDING" },
      include: {
        timeEntry: { include: { profile: { include: { user: { select: { name: true, email: true } } } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.employeeProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
      take: 80,
    }),
  ]);

  let totalHours = 0;
  for (const e of entries) {
    if (e.clockOutAt && e.status === "CLOSED") {
      totalHours += (e.clockOutAt.getTime() - e.clockInAt.getTime()) / (1000 * 60 * 60);
    }
  }
  totalHours = Math.round(totalHours * 10) / 10;

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/timesheets"
        title="Timesheets"
        description="Review clock entries from the employee time clock. Approval here is operational review — not payroll processing."
      />

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3 print:hidden">
        <label className="text-sm font-semibold">
          From
          <input
            type="date"
            name="from"
            defaultValue={params.from || range.from.toISOString().slice(0, 10)}
            className="ml-2 rounded-xl border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold">
          To
          <input
            type="date"
            name="to"
            defaultValue={params.to || range.to.toISOString().slice(0, 10)}
            className="ml-2 rounded-xl border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold">
          Employee
          <input
            name="employee"
            list="timesheet-employees"
            defaultValue={employeeQ || ""}
            placeholder="Name or email"
            className="ml-2 rounded-xl border border-line px-3 py-2 text-sm"
          />
        </label>
        <datalist id="timesheet-employees">
          {employees.map((p) => (
            <option key={p.id} value={p.user.name || p.user.email || ""} />
          ))}
        </datalist>
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
          Apply filters
        </button>
        <a href="/api/admin/reports/export?category=timesheets" className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold">
          Export summary CSV
        </a>
      </form>

      <p className="mt-4 text-sm text-muted">
        Closed hours in range: <strong>{totalHours}</strong> · Open entries (missing clock-out):{" "}
        <strong>{entries.filter((e) => e.status === "OPEN").length}</strong>
      </p>

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
        <h2 className="font-semibold">Time entries</h2>
        {entries.length === 0 ? (
          <AdminEmptyState
            className="mt-4"
            title="No time entries in this range"
            description="Employees clock in and out from Employee Portal → Time clock. Entries will appear here for review."
            actionLabel="Employee time clock help"
            actionHref="/admin/help"
          />
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Clock in</th>
                  <th className="px-4 py-3">Clock out</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-line">
                    <td className="px-4 py-3">{e.profile.user.name || e.profile.user.email}</td>
                    <td className="px-4 py-3">{e.clockInAt.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {e.clockOutAt?.toLocaleString() || (
                        <span className="font-semibold text-amber-800">Missing clock-out</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{hoursBetween(e.clockInAt, e.clockOutAt) ?? "—"}</td>
                    <td className="px-4 py-3">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
