import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageScheduling } from "@/lib/workforce/permissions";
import { formatShiftRange } from "@/lib/workforce/queries";
import { prisma } from "@/lib/prisma";
import { approveShiftResponseAction, publishOpenShiftOfferAction } from "./actions";

export default async function AdminOpenShiftsPage() {
  const user = await requireAdminSession();
  if (!user || !canManageScheduling(user.role)) redirect("/admin");

  const [offers, unassignedShifts] = await Promise.all([
    prisma.shiftOffer.findMany({
      where: { status: { in: ["OPEN", "FILLED"] } },
      include: {
        shift: true,
        responses: {
          where: { status: "PENDING" },
          include: { profile: { include: { user: { select: { name: true, email: true } } } } },
        },
      },
      orderBy: { shift: { startsAt: "asc" } },
    }),
    prisma.shift.findMany({
      where: {
        status: "PUBLISHED",
        assignment: { is: null },
        offer: { is: null },
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Open shifts</h1>
      <p className="mt-1 text-sm text-muted">Publish offers and approve employee requests.</p>

      {unassignedShifts.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold">Publish offer for unassigned shift</h2>
          <ul className="mt-4 space-y-4">
            {unassignedShifts.map((shift) => (
              <li key={shift.id} className="border-b border-line pb-4 last:border-0">
                <p className="font-semibold">{shift.title || shift.serviceCategory}</p>
                <p className="text-sm text-muted">{formatShiftRange(shift.startsAt, shift.endsAt)}</p>
                <form action={publishOpenShiftOfferAction} className="mt-3 flex flex-wrap gap-2">
                  <input type="hidden" name="shiftId" value={shift.id} />
                  <input name="requiredCredentialName" placeholder="Required credential (optional)" className="rounded-xl border border-line px-3 py-2 text-sm" />
                  <input name="expiresAt" type="datetime-local" className="rounded-xl border border-line px-3 py-2 text-sm" />
                  <button type="submit" className="btn btn-purple px-3 py-1.5 text-xs">
                    Publish open offer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ul className="mt-8 space-y-4">
        {offers.map((offer) => (
          <li key={offer.id} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">{offer.shift.title || offer.shift.serviceCategory}</p>
            <p className="text-sm text-muted">{formatShiftRange(offer.shift.startsAt, offer.shift.endsAt)}</p>
            <p className="text-xs font-bold uppercase text-[var(--royal)]">{offer.status}</p>
            {offer.responses.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No pending responses.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {offer.responses.map((res) => (
                  <li key={res.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm">
                    <span>{res.profile.user.name || res.profile.user.email}</span>
                    <form action={approveShiftResponseAction}>
                      <input type="hidden" name="responseId" value={res.id} />
                      <button type="submit" className="btn btn-gold px-3 py-1 text-xs">
                        Approve
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
