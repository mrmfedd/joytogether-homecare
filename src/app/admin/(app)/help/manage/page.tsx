import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageHelpContent } from "@/lib/help/access";
import { toggleHelpArticlePublishedAction } from "@/lib/help/admin-actions";
import { prisma } from "@/lib/prisma";

export default async function AdminHelpManagePage() {
  const user = await requireAdminSession();
  if (!user || !canManageHelpContent(user.role)) redirect("/admin/help");

  const [categories, faqs, stale] = await Promise.all([
    prisma.helpCategory.findMany({
      orderBy: [{ audience: "asc" }, { sortOrder: "asc" }],
      include: { articles: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.helpFaq.findMany({ orderBy: [{ audience: "asc" }, { sortOrder: "asc" }] }),
    prisma.helpArticle.findMany({
      where: {
        OR: [{ lastReviewedAt: null }, { lastReviewedAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90) } }],
      },
      take: 20,
      include: { category: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl">Manage Help Center</h1>
      <p className="mt-2 text-sm text-muted">SUPER_ADMIN only. Changes create revision history when editing existing articles.</p>
      <Link href="/admin/help/manage/new" className="btn btn-purple mt-4 inline-block px-4 py-2 text-sm">
        New article
      </Link>

      {stale.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-semibold text-amber-950">Review suggested</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">
            {stale.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/help/manage/${a.id}`} className="underline">
                  {a.title}
                </Link>{" "}
                ({a.category.audience})
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {categories.map((cat) => (
        <section key={cat.id} className="mt-8">
          <h2 className="font-display text-xl">
            {cat.audience} · {cat.title}
          </h2>
          <ul className="mt-3 space-y-2">
            {cat.articles.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm">
                <Link href={`/admin/help/manage/${a.id}`} className="font-semibold text-[var(--royal)]">
                  {a.title}
                </Link>
                <span className="text-xs text-muted">/{a.slug}</span>
                <span className={`text-xs font-bold ${a.published ? "text-green-700" : "text-red-700"}`}>
                  {a.published ? "Published" : "Draft"}
                </span>
                <form action={toggleHelpArticlePublishedAction} className="ml-auto">
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="published" value={a.published ? "false" : "true"} />
                  <button type="submit" className="text-xs font-semibold underline">
                    {a.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="font-display text-xl">FAQs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {faqs.map((f) => (
            <li key={f.id} className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="font-semibold">{f.question}</p>
              <p className="text-muted">{f.audience}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
