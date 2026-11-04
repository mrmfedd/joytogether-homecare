import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageNotices } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import {
  archiveStaffNoticeAction,
  createStaffNoticeAction,
  publishStaffNoticeAction,
  updateStaffNoticeDraftAction,
} from "./actions";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { EmployeeClassification } from "@/generated/prisma";

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canManageNotices(user.role)) redirect("/admin");

  const params = await searchParams;
  const showArchived = params.view === "archived";

  const notices = await prisma.staffNotice.findMany({
    where: showArchived ? { archivedAt: { not: null } } : { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      _count: { select: { recipients: true } },
      recipients: {
        take: 1,
        select: { ackAt: true, readAt: true },
      },
    },
  });

  const ackStats = await prisma.staffNoticeRecipient.groupBy({
    by: ["noticeId"],
    where: { noticeId: { in: notices.map((n) => n.id) }, ackAt: { not: null } },
    _count: { _all: true },
  });
  const ackMap = new Map(ackStats.map((a) => [a.noticeId, a._count._all]));

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/notices"
        title="Staff notices"
        description="Publish workplace announcements (no PHI in email)."
      />

      <nav className="mt-4 flex gap-2">
        <Link
          href="/admin/notices"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!showArchived ? "bg-[var(--royal)] text-white" : "border border-line bg-white"}`}
        >
          Active
        </Link>
        <Link
          href="/admin/notices?view=archived"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${showArchived ? "bg-[var(--royal)] text-white" : "border border-line bg-white"}`}
        >
          Archived
        </Link>
      </nav>

      {!showArchived ? (
        <form action={createStaffNoticeAction} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold">New draft notice</h2>
          <input name="title" required placeholder="Title" className="w-full rounded-xl border border-line px-3 py-2" />
          <textarea name="body" required rows={4} placeholder="Notice body" className="w-full rounded-xl border border-line px-3 py-2" />
          <div className="flex flex-wrap gap-4 text-sm">
            <label>
              Priority
              <select name="priority" className="ml-2 rounded-xl border border-line px-2 py-1">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input name="requiresAck" type="checkbox" /> Requires acknowledgment
            </label>
            <label className="flex items-center gap-2">
              <input name="targetAll" type="checkbox" defaultChecked /> All active employees
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <label>
              Or filter by classification
              <select name="targetClassification" className="mt-1 w-full rounded-xl border border-line px-2 py-1">
                <option value="">Any</option>
                {Object.values(EmployeeClassification).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Department (optional)
              <input name="targetDepartment" className="mt-1 w-full rounded-xl border border-line px-2 py-1" />
            </label>
          </div>
          <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
            Save draft notice
          </button>
        </form>
      ) : null}

      <ul className="mt-8 space-y-4">
        {notices.map((n) => (
          <li key={n.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/admin/notices/${n.id}`} className="font-semibold text-[var(--royal)] hover:underline">
                  {n.title}
                </Link>
                <p className="text-xs text-muted">
                  {n.archivedAt
                    ? `Archived ${n.archivedAt.toLocaleString()}`
                    : n.publishedAt
                      ? `Published ${n.publishedAt.toLocaleString()}`
                      : "Draft"}{" "}
                  · {n._count.recipients} recipients
                  {n.requiresAck ? ` · ${ackMap.get(n.id) || 0} acknowledged` : ""}
                </p>
              </div>
              <span className="text-xs font-bold uppercase text-[var(--royal)]">{n.priority}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{n.body}</p>
            {!n.publishedAt && !n.archivedAt ? (
              <form action={publishStaffNoticeAction} className="mt-3">
                <input type="hidden" name="noticeId" value={n.id} />
                <button type="submit" className="btn btn-gold px-3 py-1.5 text-xs">
                  Publish & notify
                </button>
              </form>
            ) : null}
          </li>
        ))}
        {notices.length === 0 ? (
          <AdminEmptyState
            title={showArchived ? "No archived notices" : "No staff notices yet"}
            description={
              showArchived
                ? "Archived notices are hidden from the default list."
                : "Create a draft notice above, then publish when you are ready. Email notifications contain workplace information only — never patient health information."
            }
          />
        ) : null}
      </ul>
    </div>
  );
}
