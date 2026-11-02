import { redirect } from "next/navigation";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { formatShiftRange } from "@/lib/workforce/queries";
import { employeeMeetsOfferRequirements } from "@/lib/workforce/shifts";
import { prisma } from "@/lib/prisma";
import { claimOpenShiftAction } from "./actions";

export default async function EmployeeOpenShiftsPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const now = new Date();
  const offers = await prisma.shiftOffer.findMany({
    where: {
      status: "OPEN",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      shift: { status: "PUBLISHED", startsAt: { gte: now } },
    },
    include: { shift: true, responses: { where: { profileId: profile.id } } },
    orderBy: { shift: { startsAt: "asc" } },
  });

  const credentials = await prisma.employeeCredential.findMany({ where: { profileId: profile.id } });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Open shifts</h1>
      <p className="mt-1 text-sm text-muted">Request shifts that match your role and credentials.</p>

      <ul className="mt-6 space-y-4">
        {offers.map((offer) => {
          const eligible = employeeMeetsOfferRequirements(
            profile.classification,
            credentials,
            offer.requiredClassification,
            offer.requiredCredentialName,
          );
          const myResponse = offer.responses[0];
          return (
            <li key={offer.id} className="rounded-2xl border border-line bg-white p-4">
              <p className="font-semibold">{offer.shift.title || offer.shift.serviceCategory}</p>
              <p className="text-sm text-muted">{formatShiftRange(offer.shift.startsAt, offer.shift.endsAt, profile.timezone)}</p>
              {offer.requiredClassification ? (
                <p className="mt-1 text-xs text-muted">Requires: {offer.requiredClassification.replace(/_/g, " ")}</p>
              ) : null}
              {offer.requiredCredentialName ? (
                <p className="text-xs text-muted">Credential: {offer.requiredCredentialName}</p>
              ) : null}
              {!eligible ? <p className="mt-2 text-sm text-amber-800">You do not meet the requirements for this offer.</p> : null}
              {myResponse ? (
                <p className="mt-2 text-sm font-semibold text-[var(--royal)]">Your request: {myResponse.status}</p>
              ) : eligible ? (
                <form action={claimOpenShiftAction} className="mt-3">
                  <input type="hidden" name="offerId" value={offer.id} />
                  <button type="submit" className="btn btn-gold px-4 py-2 text-sm">
                    Request shift
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
      {offers.length === 0 ? <p className="mt-6 text-sm text-muted">No open shifts right now.</p> : null}
    </div>
  );
}
