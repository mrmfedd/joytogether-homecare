import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canReviewTimeOff } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { reviewTimeOffRequestAction } from "./actions";

export default async function AdminTimeOffPage() {
  const user = await requireAdminSession();
  if (!user || !canReviewTimeOff(user.role)) redirect("/admin");

  const requests = await prisma.employeeTimeOffRequest.findMany({
    include: { profile: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Time off requests</h1>
      <ul className="mt-6 space-y-4">
        {requests.map((req) => (
          <li key={req.id} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">{req.profile.user.name || req.profile.user.email}</p>
            <p className="text-sm">
              {req.startDate.toLocaleDateString()} – {req.endDate.toLocaleDateString()}
            </p>
            <p className="text-xs font-bold uppercase text-[var(--royal)]">{req.status}</p>
            {req.reason ? <p className="mt-2 text-sm text-muted">{req.reason}</p> : null}
            {req.status === "PENDING" ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <form action={reviewTimeOffRequestAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <input name="reviewNote" placeholder="Optional note" className="rounded-xl border border-line px-3 py-2 text-sm" />
                  <button type="submit" className="btn btn-purple px-3 py-1.5 text-xs">
                    Approve
                  </button>
                </form>
                <form action={reviewTimeOffRequestAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="status" value="DENIED" />
                  <input name="reviewNote" placeholder="Optional note" className="rounded-xl border border-line px-3 py-2 text-sm" />
                  <button type="submit" className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold">
                    Deny
                  </button>
                </form>
              </div>
            ) : req.reviewNote ? (
              <p className="mt-2 text-xs text-muted">Review note: {req.reviewNote}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
