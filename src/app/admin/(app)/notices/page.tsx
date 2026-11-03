import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageNotices } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import { createStaffNoticeAction, publishStaffNoticeAction } from "./actions";

export default async function AdminNoticesPage() {
  const user = await requireAdminSession();
  if (!user || !canManageNotices(user.role)) redirect("/admin");

  const notices = await prisma.staffNotice.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { _count: { select: { recipients: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Staff notices</h1>
      <p className="mt-1 text-sm text-muted">Publish workplace announcements (no PHI in email).</p>

      <form action={createStaffNoticeAction} className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-5">
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
        <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
          Save draft notice
        </button>
      </form>

      <ul className="mt-8 space-y-4">
        {notices.map((n) => (
          <li key={n.id} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">{n.title}</p>
            <p className="text-xs text-muted">
              {n.publishedAt ? `Published ${n.publishedAt.toLocaleString()}` : "Draft"} · {n._count.recipients} recipients
            </p>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{n.body}</p>
            {!n.publishedAt ? (
              <form action={publishStaffNoticeAction} className="mt-3">
                <input type="hidden" name="noticeId" value={n.id} />
                <button type="submit" className="btn btn-gold px-3 py-1.5 text-xs">
                  Publish & notify
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
