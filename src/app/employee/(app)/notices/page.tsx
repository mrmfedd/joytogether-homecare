import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { prisma } from "@/lib/prisma";
import { acknowledgeNoticeAction, markNoticeReadAction } from "./actions";

export default async function EmployeeNoticesPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const recipients = await prisma.staffNoticeRecipient.findMany({
    where: { profileId: profile.id, notice: { publishedAt: { not: null } } },
    include: { notice: true },
    orderBy: { notice: { publishedAt: "desc" } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Notices</h1>
      <p className="mt-1 text-sm text-muted">Workplace announcements — no patient details.</p>

      <ul className="mt-6 space-y-4">
        {recipients.map((row) => (
          <li key={row.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--royal)]">{row.notice.priority}</p>
                <h2 className="font-display text-xl">{row.notice.title}</h2>
                <p className="mt-1 text-xs text-muted">
                  {row.notice.publishedAt?.toLocaleString()}
                  {!row.readAt ? " · Unread" : null}
                </p>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{row.notice.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!row.readAt ? (
                <form action={markNoticeReadAction}>
                  <input type="hidden" name="recipientId" value={row.id} />
                  <button type="submit" className="btn btn-purple px-3 py-1.5 text-xs">
                    Mark read
                  </button>
                </form>
              ) : null}
              {row.notice.requiresAck && !row.ackAt ? (
                <form action={acknowledgeNoticeAction}>
                  <input type="hidden" name="recipientId" value={row.id} />
                  <button type="submit" className="btn btn-gold px-3 py-1.5 text-xs">
                    Acknowledge
                  </button>
                </form>
              ) : row.ackAt ? (
                <p className="text-xs font-semibold text-[var(--joy-green)]">Acknowledged</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {recipients.length === 0 ? <p className="mt-6 text-sm text-muted">No notices yet.</p> : null}
    </div>
  );
}
