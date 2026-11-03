import { redirect } from "next/navigation";
import type { TimeOffStatus } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { canReviewTimeOff } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { reviewTimeOffRequestAction } from "./actions";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

const tabs: { id: TimeOffStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "DENIED", label: "Denied" },
];

export default async function AdminTimeOffPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canReviewTimeOff(user.role)) redirect("/admin");

  const params = await searchParams;
  const statusFilter =
    params.status === "PENDING" || params.status === "APPROVED" || params.status === "DENIED"
      ? params.status
      : undefined;

  const requests = await prisma.employeeTimeOffRequest.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { profile: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div data-help-tour="admin-time-off">
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/time-off"
        title="Time off requests"
        description="Approve or deny employee requests. Approved time off blocks open-shift assignment for overlapping dates."
      />

      <nav className="mt-4 flex flex-wrap gap-2 print:hidden">
        {tabs.map((tab) => {
          const href =
            tab.id === "ALL" ? "/admin/time-off" : `/admin/time-off?status=${tab.id}`;
          const active = (statusFilter || "ALL") === tab.id;
          return (
            <a
              key={tab.id}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                active ? "bg-[var(--royal)] text-white" : "border border-line bg-white"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>

      {requests.length === 0 ? (
        <AdminEmptyState
          className="mt-6"
          title="No time off requests"
          description={
            statusFilter
              ? `No ${statusFilter.toLowerCase()} requests to show.`
              : "When employees submit time off from their portal, requests appear here for review."
          }
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {requests.map((req) => (
            <li key={req.id} className="rounded-2xl border border-line bg-white p-5">
              <p className="font-semibold">{req.profile.user.name || req.profile.user.email}</p>
              <p className="text-sm">
                {req.startDate.toLocaleDateString()} – {req.endDate.toLocaleDateString()}
              </p>
              <p className="text-xs text-muted">Submitted {req.createdAt.toLocaleString()}</p>
              <p className="text-xs font-bold uppercase text-[var(--royal)]">{req.status}</p>
              {req.reason ? <p className="mt-2 text-sm text-muted">{req.reason}</p> : null}
              {req.status === "PENDING" ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={reviewTimeOffRequestAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="requestId" value={req.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <input
                      name="reviewNote"
                      placeholder="Optional note"
                      className="rounded-xl border border-line px-3 py-2 text-sm"
                    />
                    <button type="submit" className="btn btn-purple px-3 py-1.5 text-xs">
                      Approve
                    </button>
                  </form>
                  <form action={reviewTimeOffRequestAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="requestId" value={req.id} />
                    <input type="hidden" name="status" value="DENIED" />
                    <input
                      name="reviewNote"
                      placeholder="Optional note"
                      className="rounded-xl border border-line px-3 py-2 text-sm"
                    />
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
      )}
    </div>
  );
}
