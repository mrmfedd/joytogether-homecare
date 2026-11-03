import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { canManageHelpContent } from "@/lib/help/access";
import { saveHelpArticleAction } from "@/lib/help/admin-actions";
import { prisma } from "@/lib/prisma";

export default async function AdminHelpEditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canManageHelpContent(user.role)) redirect("/admin/help");

  const { id } = await params;
  if (id === "new") {
    const categories = await prisma.helpCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return (
      <ArticleEditor
        categories={categories}
        article={null}
      />
    );
  }

  const article = await prisma.helpArticle.findUnique({
    where: { id },
    include: { category: true, revisions: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!article) notFound();
  const categories = await prisma.helpCategory.findMany({ orderBy: { sortOrder: "asc" } });

  return <ArticleEditor categories={categories} article={article} />;
}

function ArticleEditor({
  categories,
  article,
}: {
  categories: { id: string; audience: string; title: string }[];
  article: {
    id: string;
    categoryId: string;
    slug: string;
    title: string;
    summary: string | null;
    content: string;
    keywords: string[];
    contextRoutes: string[];
    allowedRoles: string[];
    sortOrder: number;
    published: boolean;
    revisions?: { createdAt: Date; changeNote: string | null; title: string }[];
  } | null;
}) {
  return (
    <div>
      <Link href="/admin/help/manage" className="text-sm font-semibold text-[var(--royal)]">
        ← Back to manage
      </Link>
      <h1 className="font-display mt-4 text-3xl">{article ? "Edit article" : "New article"}</h1>
      <form action={saveHelpArticleAction} className="mt-6 grid max-w-3xl gap-3">
        {article ? <input type="hidden" name="id" value={article.id} /> : null}
        <label className="text-sm">
          Category
          <select name="categoryId" defaultValue={article?.categoryId} required className="mt-1 block w-full rounded-xl border border-line px-3 py-2">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.audience} — {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Slug
          <input name="slug" defaultValue={article?.slug} required className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Title
          <input name="title" defaultValue={article?.title} required className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Summary
          <textarea name="summary" defaultValue={article?.summary ?? ""} rows={2} className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Content (Markdown)
          <textarea name="content" defaultValue={article?.content} required rows={18} className="mt-1 block w-full rounded-xl border border-line px-3 py-2 font-mono text-xs" />
        </label>
        <label className="text-sm">
          Keywords (comma-separated)
          <input name="keywords" defaultValue={article?.keywords.join(", ") ?? ""} className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Context routes (comma-separated paths)
          <input name="contextRoutes" defaultValue={article?.contextRoutes.join(", ") ?? ""} className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Allowed roles (optional, comma-separated UserRole values)
          <input name="allowedRoles" defaultValue={article?.allowedRoles.join(", ") ?? ""} className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          Sort order
          <input name="sortOrder" type="number" defaultValue={article?.sortOrder ?? 0} className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={article?.published ?? true} />
          Published
        </label>
        {article ? (
          <label className="text-sm">
            Change note (stored in revision history)
            <input name="changeNote" className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
          </label>
        ) : null}
        <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm">
          Save article
        </button>
      </form>
      {article?.revisions?.length ? (
        <section className="mt-10">
          <h2 className="font-display text-lg">Recent revisions</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {article.revisions.map((r, i) => (
              <li key={i}>
                {r.createdAt.toLocaleString()} — {r.changeNote || r.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
