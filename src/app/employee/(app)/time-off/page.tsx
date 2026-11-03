import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { prisma } from "@/lib/prisma";
import { createTimeOffRequestAction } from "./actions";

export default async function EmployeeTimeOffPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const requests = await prisma.employeeTimeOffRequest.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-[var(--midnight)]">Time off</h1>
      <p className="mt-1 text-sm text-muted">Submit requests for scheduler review.</p>

      <form action={createTimeOffRequestAction} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Start date
            <input name="startDate" type="date" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            End date
            <input name="endDate" type="date" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm">
          Reason (optional)
          <textarea name="reason" rows={3} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
          Submit request
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {requests.map((req) => (
          <li key={req.id} className="rounded-xl border border-line bg-white p-4 text-sm">
            <p className="font-semibold">
              {req.startDate.toLocaleDateString()} – {req.endDate.toLocaleDateString()}
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--royal)]">{req.status}</p>
            {req.reason ? <p className="mt-1 text-muted">{req.reason}</p> : null}
            {req.reviewNote ? <p className="mt-2 text-xs text-muted">Review: {req.reviewNote}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
