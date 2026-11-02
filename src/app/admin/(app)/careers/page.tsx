import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { saveJobPostingAction, updateApplicationStatusAction } from "@/app/admin/(app)/careers/actions";
import { requireAdminSession } from "@/lib/auth";
import { canManageCareers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ApplicantStatus, PublicationStatus } from "@/generated/prisma";

export default async function AdminCareersPage() {
  const user = await requireAdminSession();
  if (!user || !canManageCareers(user.role)) redirect("/admin");

  const [jobs, applications] = await Promise.all([
    prisma.jobPosting.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Careers" description="Job postings and applicant pipeline." />
      <section>
        <h2 className="font-semibold">Create job posting</h2>
        <form action={saveJobPostingAction} className="mt-4 grid max-w-2xl gap-3 rounded-2xl border border-line bg-white p-5">
          <input name="title" required placeholder="Job title" className="rounded-xl border border-line px-3 py-2 text-sm" />
          <input name="slug" required placeholder="slug" pattern="[a-z0-9-]+" className="rounded-xl border border-line px-3 py-2 text-sm" />
          <input name="location" placeholder="Location" className="rounded-xl border border-line px-3 py-2 text-sm" />
          <textarea name="description" required rows={5} placeholder="Description" className="rounded-xl border border-line px-3 py-2 text-sm" />
          <select name="status" defaultValue="DRAFT" className="rounded-xl border border-line px-3 py-2 text-sm">
            {Object.values(PublicationStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm">
            Save posting
          </button>
        </form>
        <ul className="mt-6 space-y-3">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-xl border border-line bg-white p-4 text-sm">
              <form action={saveJobPostingAction} className="grid gap-2">
                <input type="hidden" name="id" value={j.id} />
                <div className="flex flex-wrap items-center gap-2">
                  <input name="title" defaultValue={j.title} className="flex-1 rounded-lg border border-line px-2 py-1 font-semibold" />
                  <StatusBadge status={j.status} />
                </div>
                <input name="slug" defaultValue={j.slug} className="rounded-lg border border-line px-2 py-1 text-xs" />
                <textarea name="description" rows={3} defaultValue={j.description} className="rounded-lg border border-line px-2 py-1" />
                <div className="flex gap-2">
                  <select name="status" defaultValue={j.status} className="rounded-lg border border-line px-2 py-1 text-xs">
                    {Object.values(PublicationStatus).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="text-xs font-bold text-[var(--royal)]">
                    Update
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Applications</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-[var(--cream)] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Resume</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-line/70 align-top">
                  <td className="px-4 py-3">{a.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {a.fullName}
                    <div className="text-xs text-muted">{a.email}</div>
                  </td>
                  <td className="px-4 py-3">{a.position}</td>
                  <td className="px-4 py-3">
                    <form action={updateApplicationStatusAction} className="flex gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      <select name="status" defaultValue={a.status} className="rounded-lg border border-line px-2 py-1 text-xs">
                        {Object.values(ApplicantStatus).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs font-bold text-[var(--royal)]">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    {a.resumeKey ? (
                      <Link href={`/api/admin/applications/${a.id}/resume`} className="font-bold text-[var(--royal)]">
                        Download
                      </Link>
                    ) : (
                      "—"
                    )}
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
