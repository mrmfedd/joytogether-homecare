import { requireAdminSession } from "@/lib/auth";
import { canManageCareers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminCareersPage() {
  const user = await requireAdminSession();
  if (!user || !canManageCareers(user.role)) redirect("/admin");

  const [jobs, applications] = await Promise.all([
    prisma.jobPosting.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Careers</h1>
      <section className="mt-6">
        <h2 className="font-semibold">Job postings</h2>
        <ul className="mt-3 space-y-2">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-xl border border-line bg-white p-4 text-sm">
              {j.title} — {j.status}
            </li>
          ))}
          {jobs.length === 0 ? <li className="text-sm text-muted">No postings yet.</li> : null}
        </ul>
      </section>
      <section className="mt-8">
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
                <tr key={a.id} className="border-b border-line/70">
                  <td className="px-4 py-3">{a.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3">{a.fullName}</td>
                  <td className="px-4 py-3">{a.position}</td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3">
                    {a.resumeKey ? (
                      <a href={`/api/admin/applications/${a.id}/resume`} className="font-bold text-[var(--royal)]">
                        Download
                      </a>
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
