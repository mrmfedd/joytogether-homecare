import { notFound, redirect } from "next/navigation";
import { HelpArticleView } from "@/components/help/HelpArticleView";
import { HelpBreadcrumbs, HelpCenterShell } from "@/components/help/HelpCenterShell";
import { HelpSearchBar } from "@/components/help/HelpSearchBar";
import { requireEmployeeSession } from "@/lib/auth";
import { getHelpArticleBySlug, getRelatedArticles, listHelpCategories } from "@/lib/help/queries";
import { searchEmployeeHelpAction } from "@/lib/help/search-actions";

export default async function EmployeeHelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");

  const { slug } = await params;
  const [article, categories] = await Promise.all([
    getHelpArticleBySlug("EMPLOYEE", slug, "EMPLOYEE"),
    listHelpCategories("EMPLOYEE", "EMPLOYEE"),
  ]);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.categoryId, "EMPLOYEE", "EMPLOYEE");

  return (
    <div id="top">
      <HelpCenterShell audience="EMPLOYEE" basePath="/employee/help" categories={categories}>
        <HelpBreadcrumbs
          basePath="/employee/help"
          items={[{ label: article.category.title }, { label: article.title }]}
        />
        <div className="mb-6">
          <HelpSearchBar basePath="/employee/help" onSearch={searchEmployeeHelpAction} />
        </div>
        <HelpArticleView
          title={article.title}
          summary={article.summary}
          content={article.content}
          related={related.map((r) => ({ slug: r.slug, title: r.title }))}
          basePath="/employee/help"
        />
      </HelpCenterShell>
    </div>
  );
}
