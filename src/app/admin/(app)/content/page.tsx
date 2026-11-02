import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminContentPage() {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) redirect("/admin");

  const pages = await prisma.pageContent.findMany({ orderBy: { key: "asc" } });
  const faqs = await prisma.fAQ.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Content</h1>
      <p className="body-muted mt-1 text-sm">Structured content blocks with draft/publish workflow.</p>
      <section className="mt-6">
        <h2 className="font-semibold">Page content</h2>
        <ul className="mt-3 space-y-2">
          {pages.map((p) => (
            <li key={p.id} className="rounded-xl border border-line bg-white p-4 text-sm">
              <strong>{p.key}</strong> — {p.status}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">FAQs ({faqs.length})</h2>
      </section>
    </div>
  );
}
