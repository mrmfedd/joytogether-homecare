import { notFound, redirect } from "next/navigation";
import { HelpArticleView } from "@/components/help/HelpArticleView";
import { HelpBreadcrumbs, HelpCenterShell } from "@/components/help/HelpCenterShell";
import { HelpSearchBar } from "@/components/help/HelpSearchBar";
import { requireAdminSession } from "@/lib/auth";
import { canManageHelpContent } from "@/lib/help/access";
import { getHelpArticleBySlug, getRelatedArticles, listHelpCategories } from "@/lib/help/queries";
import { searchAdminHelpAction } from "@/lib/help/search-actions";

export default async function AdminHelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login");

  const { slug } = await params;
  const [article, categories] = await Promise.all([
    getHelpArticleBySlug("ADMIN", slug, user.role),
    listHelpCategories("ADMIN", user.role),
  ]);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.categoryId, "ADMIN", user.role);

  return (
    <div id="top">
      <HelpCenterShell
        audience="ADMIN"
        basePath="/admin/help"
        categories={categories}
        showManageLink={canManageHelpContent(user.role)}
      >
        <HelpBreadcrumbs
          basePath="/admin/help"
          items={[
            { label: article.category.title, href: `/admin/help?category=${article.category.slug}` },
            { label: article.title },
          ]}
        />
        <div className="mb-6">
          <HelpSearchBar basePath="/admin/help" onSearch={searchAdminHelpAction} />
        </div>
        <HelpArticleView
          title={article.title}
          summary={article.summary}
          content={article.content}
          related={related.map((r) => ({ slug: r.slug, title: r.title }))}
          basePath="/admin/help"
        />
      </HelpCenterShell>
    </div>
  );
}
