import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { saveFaqAction, deleteFaqAction } from "@/app/admin/(app)/content/actions";
import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PublicationStatus } from "@/generated/prisma";

export default async function AdminContentPage() {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) redirect("/admin");

  const [pages, faqs] = await Promise.all([
    prisma.pageContent.findMany({ orderBy: { key: "asc" } }),
    prisma.fAQ.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Content" description="Structured website content with draft, publish, and revision history." />
      <section>
        <h2 className="font-semibold">Page blocks</h2>
        <ul className="mt-3 space-y-2">
          {pages.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white p-4 text-sm">
              <span>
                <strong>{p.key}</strong> — {p.title}
              </span>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                <Link href={`/admin/content/${encodeURIComponent(p.key)}`} className="font-bold text-[var(--royal)]">
                  Edit
                </Link>
              </div>
            </li>
          ))}
          <li>
            <Link href="/admin/content/new" className="text-sm font-bold text-[var(--royal)]">
              + New page block
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">FAQs</h2>
        <form action={saveFaqAction} className="mt-4 space-y-3 rounded-2xl border border-line bg-white p-5">
          <input name="question" required placeholder="Question" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
          <textarea name="answer" required rows={3} placeholder="Answer" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
          <div className="flex flex-wrap gap-3">
            <input name="displayOrder" type="number" defaultValue={faqs.length} className="w-24 rounded-xl border border-line px-3 py-2 text-sm" />
            <select name="status" defaultValue="DRAFT" className="rounded-xl border border-line px-3 py-2 text-sm">
              {Object.values(PublicationStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
              Add FAQ
            </button>
          </div>
        </form>
        <ul className="mt-4 space-y-3">
          {faqs.map((f) => (
            <li key={f.id} className="rounded-xl border border-line bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{f.question}</p>
                  <p className="mt-1 text-muted">{f.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={f.status} />
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className="text-xs font-bold text-red-700">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
