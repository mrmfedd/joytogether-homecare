import type { HelpAudience, UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { canViewHelpArticle } from "./access";

const articleInclude = {
  category: true,
} as const;

export async function listHelpCategories(audience: HelpAudience, role: UserRole) {
  const categories = await prisma.helpCategory.findMany({
    where: { audience },
    orderBy: { sortOrder: "asc" },
    include: {
      articles: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return categories
    .map((cat) => ({
      ...cat,
      articles: cat.articles.filter((a) => canViewHelpArticle(role, { ...a, category: cat })),
    }))
    .filter((cat) => cat.articles.length > 0);
}

export async function getHelpArticleBySlug(audience: HelpAudience, slug: string, role: UserRole) {
  const article = await prisma.helpArticle.findFirst({
    where: { slug, category: { audience } },
    include: articleInclude,
  });
  if (!article || !canViewHelpArticle(role, article)) return null;
  return article;
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string,
  audience: HelpAudience,
  role: UserRole,
  limit = 4,
) {
  const articles = await prisma.helpArticle.findMany({
    where: {
      published: true,
      category: { audience },
      id: { not: articleId },
      OR: [{ categoryId }, { category: { audience } }],
    },
    include: articleInclude,
    orderBy: [{ categoryId: "desc" }, { sortOrder: "asc" }],
    take: limit + 5,
  });
  return articles.filter((a) => canViewHelpArticle(role, a)).slice(0, limit);
}

export async function listHelpFaqs(audience: HelpAudience) {
  return prisma.helpFaq.findMany({
    where: { audience, published: true },
    orderBy: { sortOrder: "asc" },
    include: { article: { select: { slug: true, title: true } } },
  });
}

export async function listAllPublishedArticles(audience: HelpAudience, role: UserRole) {
  const articles = await prisma.helpArticle.findMany({
    where: { published: true, category: { audience } },
    include: articleInclude,
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
  return articles.filter((a) => canViewHelpArticle(role, a));
}

export async function getArticleForContextRoute(audience: HelpAudience, route: string, role: UserRole) {
  const normalized = route.split("?")[0] ?? route;
  const articles = await prisma.helpArticle.findMany({
    where: {
      published: true,
      category: { audience },
      contextRoutes: { hasSome: [normalized] },
    },
    include: articleInclude,
    orderBy: { sortOrder: "asc" },
    take: 1,
  });
  const article = articles[0];
  if (!article || !canViewHelpArticle(role, article)) return null;
  return article;
}
