import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManagePatientMessages, canViewPatientDirectory } from "@/lib/patient/permissions";
import { listThreadsForUser, decryptMessageBody } from "@/lib/patient/messaging";
import { acknowledgeUrgentThreadAction, replyMessageAction } from "./actions";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; filter?: string; threadId?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewPatientDirectory(user.role)) redirect("/admin");

  const params = await searchParams;
  const urgentOnly = params.filter === "urgent";
  const unreadOnly = params.filter === "unread";

  const threads = await listThreadsForUser(user.id, {
    patientId: params.patientId,
    urgentOnly,
    unreadOnly,
  });

  const selected = params.threadId
    ? await prisma.messageThread.findFirst({
        where: { id: params.threadId, participants: { some: { userId: user.id } } },
        include: {
          patient: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: { sender: { select: { name: true, email: true } } },
          },
        },
      })
    : null;

  const canReply = canManagePatientMessages(user.role);

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/messages"
        title="Messages"
        description="Secure in-app messaging. Notifications do not include patient names. Not an emergency line."
      />

      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/messages" className="rounded-xl border border-line bg-white px-3 py-2 font-semibold">
          Inbox
        </Link>
        <Link href="/admin/messages?filter=unread" className="rounded-xl border border-line bg-white px-3 py-2 font-semibold">
          Unread
        </Link>
        <Link href="/admin/messages?filter=urgent" className="rounded-xl border border-line bg-white px-3 py-2 font-semibold">
          Urgent
        </Link>
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ul className="space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/messages?threadId=${t.id}`}
                className="block rounded-xl border border-line bg-white p-4 text-sm hover:border-[var(--joy-green)]"
              >
                <p className="font-semibold">
                  {t.urgency === "URGENT" ? "🚨 " : ""}
                  {t.subject}
                </p>
                {t.patient ? (
                  <p className="text-muted">
                    Patient: {t.patient.lastName}, {t.patient.firstName}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
          {threads.length === 0 ? <p className="text-sm text-muted">No messages.</p> : null}
        </ul>

        <section className="rounded-2xl border border-line bg-white p-5">
          {!selected ? (
            <p className="text-sm text-muted">Select a conversation.</p>
          ) : (
            <>
              <h2 className="font-display text-xl">{selected.subject}</h2>
              {selected.patient ? (
                <Link href={`/admin/patients/${selected.patient.id}`} className="text-sm font-semibold text-[var(--royal)]">
                  View patient chart
                </Link>
              ) : null}
              {selected.urgency === "URGENT" && !selected.officeAckAt && canReply ? (
                <form action={acknowledgeUrgentThreadAction} className="mt-3">
                  <input type="hidden" name="threadId" value={selected.id} />
                  <button type="submit" className="btn btn-gold px-3 py-1.5 text-xs">
                    Acknowledge urgent thread
                  </button>
                </form>
              ) : null}
              <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                {selected.messages.map((m) => (
                  <li key={m.id} className="rounded-xl bg-[var(--cream)] p-3 text-sm">
                    <p className="text-xs font-bold text-muted">
                      {m.sender.name ?? m.sender.email} · {m.createdAt.toLocaleString()}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{decryptMessageBody(m.body)}</p>
                  </li>
                ))}
              </ul>
              {canReply ? (
                <form action={replyMessageAction} className="mt-4 space-y-2">
                  <input type="hidden" name="threadId" value={selected.id} />
                  <textarea name="body" rows={3} required placeholder="Reply" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
                  <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
                    Send reply
                  </button>
                </form>
              ) : null}
            </>
          )}
        </section>
      </div>

      <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Medical emergencies require 911. The office is not monitoring this inbox 24/7 unless your agency has configured a monitored service.
      </p>
    </div>
  );
}