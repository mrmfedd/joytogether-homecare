import Link from "next/link";
import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { listThreadsForUser, decryptMessageBody } from "@/lib/patient/messaging";
import { employeeReplyMessageAction } from "./actions";

export default async function EmployeeMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ threadId?: string }>;
}) {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const params = await searchParams;
  const threads = await listThreadsForUser(user.id);
  const selected = threads.find((t) => t.id === params.threadId);

  const messages =
    selected &&
    (await import("@/lib/prisma").then(({ prisma }) =>
      prisma.message.findMany({
        where: { threadId: selected.id },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, email: true } } },
      }),
    ));

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Messages</h1>
      <p className="mt-2 text-sm text-muted">Secure office communication — no patient names in external notifications.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ul className="space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/employee/messages?threadId=${t.id}`} className="block rounded-xl border border-line bg-white p-4 text-sm">
                {t.urgency === "URGENT" ? <span className="font-bold text-amber-800">Urgent · </span> : null}
                {t.subject}
                {t.officeAckAt ? <span className="mt-1 block text-xs text-green-800">Office acknowledged</span> : null}
              </Link>
            </li>
          ))}
        </ul>
        <section className="rounded-2xl border border-line bg-white p-5">
          {selected && messages ? (
            <>
              <h2 className="font-semibold">{selected.subject}</h2>
              <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-xl bg-[var(--cream)] p-3 text-sm">
                    <p className="text-xs text-muted">{m.sender.name ?? m.sender.email}</p>
                    <p className="mt-1 whitespace-pre-wrap">{decryptMessageBody(m.body)}</p>
                  </li>
                ))}
              </ul>
              <form action={employeeReplyMessageAction} className="mt-4 space-y-2">
                <input type="hidden" name="threadId" value={selected.id} />
                <textarea name="body" rows={3} required className="w-full rounded-xl border border-line px-3 py-3 text-base" />
                <button type="submit" className="btn btn-purple min-h-12 w-full py-3 text-base font-semibold">
                  Reply
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-muted">Select a thread.</p>
          )}
        </section>
      </div>
    </div>
  );
}