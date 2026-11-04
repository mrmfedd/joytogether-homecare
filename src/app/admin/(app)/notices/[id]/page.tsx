import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageNotices } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { EmployeeClassification } from "@/generated/prisma";
import {
  archiveStaffNoticeAction,
  publishStaffNoticeAction,
  updateStaffNoticeDraftAction,
} from "../actions";

export default async function AdminNoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canManageNotices(user.role)) redirect("/admin");

  const { id } = await params;
  const notice = await prisma.staffNotice.findUnique({
    where: { id },
    include: {
      recipients: {
        include: { profile: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!notice) notFound();

  const ackCount = notice.recipients.filter((r) => r.ackAt).length;
  const readCount = notice.recipients.filter((r) => r.readAt).length;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/notices" className="text-sm font-bold text-[var(--royal)] hover:underline">
        ← All notices
      </Link>
      <h1 className="mt-2 font-display text-3xl text-[var(--midnight)]">{notice.title}</h1>
      <p className="text-sm text-muted">
        {notice.publishedAt ? `Published ${notice.publishedAt.toLocaleString()}` : "Draft"}
        {notice.archivedAt ? ` · Archived ${notice.archivedAt.toLocaleString()}` : ""}
      </p>

      {!notice.publishedAt && !notice.archivedAt ? (
        <form action={updateStaffNoticeDraftAction} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-5">
          <input type="hidden" name="noticeId" value={notice.id} />
          <input name="title" required defaultValue={notice.title} className="w-full rounded-xl border border-line px-3 py-2" />
          <textarea name="body" required rows={6} defaultValue={notice.body} className="w-full rounded-xl border border-line px-3 py-2" />
          <div className="flex flex-wrap gap-4 text-sm">
            <label>
              Priority
              <select name="priority" defaultValue={notice.priority} className="ml-2 rounded-xl border border-line px-2 py-1">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input name="requiresAck" type="checkbox" defaultChecked={notice.requiresAck} /> Requires acknowledgment
            </label>
            <label className="flex items-center gap-2">
              <input name="targetAll" type="checkbox" defaultChecked={notice.targetAll} /> All active employees
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <label>
              Classification filter
              <select
                name="targetClassification"
                defaultValue={notice.targetClassification || ""}
                className="mt-1 w-full rounded-xl border border-line px-2 py-1"
              >
                <option value="">Any</option>
                {Object.values(EmployeeClassification).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Department
              <input
                name="targetDepartment"
                defaultValue={notice.targetDepartment || ""}
                className="mt-1 w-full rounded-xl border border-line px-2 py-1"
              />
            </label>
          </div>
          <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
            Save draft
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-sm whitespace-pre-wrap">{notice.body}</div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {!notice.publishedAt && !notice.archivedAt ? (
          <form action={publishStaffNoticeAction}>
            <input type="hidden" name="noticeId" value={notice.id} />
            <button type="submit" className="btn btn-gold px-4 py-2 text-sm">
              Publish & notify
            </button>
          </form>
        ) : null}
        {!notice.archivedAt ? (
          <form action={archiveStaffNoticeAction}>
            <input type="hidden" name="noticeId" value={notice.id} />
            <button type="submit" className="rounded-xl border border-line px-4 py-2 text-sm font-semibold">
              Archive notice
            </button>
          </form>
        ) : null}
      </div>

      {notice.publishedAt ? (
        <section className="mt-10">
          <h2 className="font-semibold">Recipients & acknowledgments</h2>
          <p className="text-sm text-muted">
            Read: {readCount} / {notice.recipients.length}
            {notice.requiresAck ? ` · Acknowledged: ${ackCount} / ${notice.recipients.length}` : ""}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Read</th>
                  <th className="px-4 py-3">Acknowledged</th>
                </tr>
              </thead>
              <tbody>
                {notice.recipients.map((r) => (
                  <tr key={r.id} className="border-b border-line">
                    <td className="px-4 py-3">{r.profile.user.name || r.profile.user.email}</td>
                    <td className="px-4 py-3">{r.readAt ? r.readAt.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">{r.ackAt ? r.ackAt.toLocaleString() : notice.requiresAck ? "Pending" : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
