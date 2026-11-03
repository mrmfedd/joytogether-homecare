import type { HelpAudience, UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { canViewHelpArticle } from "./access";
import { scoreMatch } from "./search-scoring";

export type HelpSearchHit = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  categoryTitle: string;
  categorySlug: string;
  score: number;
};

export { scoreMatch };

export async function searchHelpArticles(
  audience: HelpAudience,
  role: UserRole,
  query: string,
  categorySlug?: string,
): Promise<HelpSearchHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const articles = await prisma.helpArticle.findMany({
    where: {
      published: true,
      category: {
        audience,
        ...(categorySlug ? { slug: categorySlug } : {}),
      },
    },
    include: { category: true },
  });

  const hits: HelpSearchHit[] = [];
  for (const article of articles) {
    if (!canViewHelpArticle(role, article)) continue;
    const score = scoreMatch(trimmed, [
      article.title,
      article.summary,
      article.content,
      article.category.title,
      ...article.keywords,
    ]);
    if (score <= 0) continue;
    hits.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      categoryTitle: article.category.title,
      categorySlug: article.category.slug,
      score,
    });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 25);
}
