import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageEmployees } from "@/lib/workforce/permissions";
import { prisma } from "@/lib/prisma";
import {
  createEmployeeManuallyAction,
  deactivateEmployeeProfileAction,
  deleteEmployeeProfileAction,
  regenerateEmployeeActivationLinkAction,
  sendEmployeeActivationEmailAction,
  sendAllPendingActivationEmailsAction,
} from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { CopyEmployeeActivationLink } from "./CopyEmployeeActivationLink";

const classifications = [
  "CAREGIVER",
  "HOME_HEALTH_AIDE",
  "CNA",
  "LPN",
  "RN",
  "HOSPICE_STAFF",
  "TRANSPORTATION_STAFF",
  "SCHEDULER",
  "SUPERVISOR",
] as const;

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    created?: string;
    activation?: string;
    expires?: string;
    deleted?: string;
    emailsAccepted?: string;
    emailsFailed?: string;
    emailsRemaining?: string;
  }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canManageEmployees(user.role)) redirect("/admin");

  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : null;
  const created = params.created === "1";
  const activationUrl = params.activation ? decodeURIComponent(params.activation) : null;
  const activationExpires = params.expires ? decodeURIComponent(params.expires) : null;
  const emailsAccepted = params.emailsAccepted ? Number(params.emailsAccepted) : null;
  const emailsFailed = params.emailsFailed ? Number(params.emailsFailed) : 0;
  const emailsRemaining = params.emailsRemaining ? Number(params.emailsRemaining) : 0;

  const [profiles, pendingInvites] = await Promise.all([
    prisma.employeeProfile.findMany({
      include: { user: { select: { email: true, name: true, active: true, lastLoginAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employeeInvitation.findMany({
      where: { acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const pendingProfiles = profiles.filter((p) =>
    !p.user.active && p.employmentStatus === "INVITED"
  );

  return (
    <div data-help-tour="admin-employees">
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/employees"
        title="Employees"
        description="Add caregivers, generate private activation links, or email password-setup links to pending caregivers."
      />

      {created ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          <span className="font-semibold">Employee profile created (pending activation).</span>
          {activationUrl ? (
            <>
              {" "}
              Share this one-time activation link privately. It will not be shown again after you leave this page.
              {activationExpires ? (
                <span className="mt-1 block text-green-800">
                  Expires: {new Date(activationExpires).toLocaleString()}
                </span>
              ) : null}
              <CopyEmployeeActivationLink activationUrl={activationUrl} />
            </>
          ) : (
            " If you did not copy the activation link, resolve duplicate email issues and add the employee again."
          )}
        </div>
      ) : null}
      {emailsAccepted !== null ? (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950" role="status">
          Email provider accepted {emailsAccepted} activation email{emailsAccepted === 1 ? "" : "s"} for delivery.
          {emailsFailed > 0 ? ` ${emailsFailed} could not be sent or were skipped (including recently contacted caregivers).` : ""}
          {emailsRemaining > 0 ? ` ${emailsRemaining} were not attempted because of the per-batch limit. Run another batch after reviewing the results.` : ""}
          {" "}Delivery to individual inboxes is not guaranteed; caregivers should check their spam folders.
        </div>
      ) : null}
      {params.deleted === "1" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Employee removed permanently.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg">Add employee manually</h2>
        <p className="mt-1 text-sm text-muted">
          Creates a pending profile. Copy the one-time activation link below and share it privately (in person, phone, or
          your own text), or use the email actions below. They set their own password on first visit.
        </p>
        <form action={createEmployeeManuallyAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Name
            <input name="name" type="text" required autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            Email
            <input name="email" type="email" required autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            Classification
            <select name="classification" required className="mt-1 block rounded-xl border border-line px-3 py-2">
              {classifications.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Phone <span className="text-muted">(optional)</span>
            <input name="phone" type="tel" autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            Department <span className="text-muted">(optional)</span>
            <input name="department" autoComplete="off" className="mt-1 block rounded-xl border border-line px-3 py-2" />
          </label>
          <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
            Create employee
          </button>
        </form>
      </section>

      {pendingInvites.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
          <h2 className="font-display text-lg text-amber-950">Pending activations</h2>
          <p className="mt-1 text-sm text-amber-900">
            These employees have not completed password setup. You can send a fresh, private link by email,
            or choose <strong>New activation link</strong> and share the link manually. Previously issued
            links become invalid after an activation email is accepted.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-amber-950">
            {pendingInvites.map((inv) => (
              <li key={inv.id}>
                {inv.email} · {inv.classification.replace(/_/g, " ")} · expires{" "}
                {inv.expiresAt.toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Active roster</h2>
            <p className="mt-1 text-sm text-muted">{pendingProfiles.length} caregiver{pendingProfiles.length === 1 ? "" : "s"} awaiting activation.</p>
          </div>
          {pendingProfiles.length > 0 ? (
            <form action={sendAllPendingActivationEmailsAction}>
              <ConfirmSubmitButton
                className="btn btn-purple px-4 py-2 text-sm"
                message={`Send a new activation email to up to 40 pending caregivers? Existing activation links will be invalidated after each email is accepted by the provider. No active employee will receive an email.`}
              >
                Send to All Pending Caregivers
              </ConfirmSubmitButton>
            </form>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-muted">
          Emails are sent only when you click and confirm. Each caregiver receives their own one-time password setup link.
          A batch processes up to 40 caregivers. Email provider acceptance does not guarantee inbox delivery.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold">{p.user.name || "—"}</td>
                  <td className="px-4 py-3">{p.user.email}</td>
                  <td className="px-4 py-3">{p.classification.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    {p.employmentStatus}
                    {!p.user.active && p.employmentStatus === "INVITED" ? (
                      <span className="ml-2 text-xs text-amber-800">(awaiting activation)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {!p.user.active && p.employmentStatus === "INVITED" ? (
                        <form action={regenerateEmployeeActivationLinkAction}>
                          <input type="hidden" name="profileId" value={p.id} />
                          <button type="submit" className="text-xs font-semibold text-[var(--royal)]">
                            New activation link
                          </button>
                        </form>
                        <form action={sendEmployeeActivationEmailAction}>
                          <input type="hidden" name="profileId" value={p.id} />
                          <ConfirmSubmitButton
                            className="text-xs font-semibold text-[var(--royal)]"
                            message={`Send a fresh activation email to ${p.user.email}? Their earlier unredeemed links will be invalidated after the email provider accepts it.`}
                          >
                            Send Activation Email
                          </ConfirmSubmitButton>
                        </form>
                      ) : null}
                      {p.employmentStatus === "ACTIVE" && p.user.active ? (
                        <form action={deactivateEmployeeProfileAction}>
                          <input type="hidden" name="profileId" value={p.id} />
                          <button type="submit" className="text-xs font-semibold text-amber-800">
                            Deactivate
                          </button>
                        </form>
                      ) : null}
                      {(!p.user.active && p.employmentStatus === "INVITED") || p.employmentStatus === "INACTIVE" ? (
                        <form action={deleteEmployeeProfileAction}>
                          <input type="hidden" name="profileId" value={p.id} />
                          <ConfirmSubmitButton
                            message={`Permanently remove ${p.user.name || p.user.email}? This cannot be undone.`}
                            className="text-xs font-semibold text-red-700"
                          >
                            Remove
                          </ConfirmSubmitButton>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}