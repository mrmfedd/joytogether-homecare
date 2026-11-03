import type { PrismaClient } from "../../src/generated/prisma";
import { helpSeedCategories, helpSeedFaqs } from "../src/content/help/seed-data";

export async function seedHelpCenter(prisma: PrismaClient) {
  for (const cat of helpSeedCategories) {
    const category = await prisma.helpCategory.upsert({
      where: {
        audience_slug: { audience: cat.audience, slug: cat.slug },
      },
      create: {
        audience: cat.audience,
        slug: cat.slug,
        title: cat.title,
        summary: cat.summary,
        sortOrder: cat.sortOrder,
      },
      update: {
        title: cat.title,
        summary: cat.summary,
        sortOrder: cat.sortOrder,
      },
    });

    for (const article of cat.articles) {
      await prisma.helpArticle.upsert({
        where: {
          categoryId_slug: { categoryId: category.id, slug: article.slug },
        },
        create: {
          categoryId: category.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          content: article.content,
          keywords: article.keywords,
          contextRoutes: article.contextRoutes,
          allowedRoles: article.allowedRoles ?? [],
          sortOrder: article.sortOrder,
          published: true,
          lastReviewedAt: new Date("2026-10-31T12:00:00Z"),
        },
        update: {
          title: article.title,
          summary: article.summary,
          content: article.content,
          keywords: article.keywords,
          contextRoutes: article.contextRoutes,
          allowedRoles: article.allowedRoles ?? [],
          sortOrder: article.sortOrder,
          published: true,
          lastReviewedAt: new Date("2026-10-31T12:00:00Z"),
        },
      });
    }
  }

  for (const faq of helpSeedFaqs) {
    let articleId: string | null = null;
    if (faq.articleSlug) {
      const article = await prisma.helpArticle.findFirst({
        where: { slug: faq.articleSlug },
        select: { id: true },
      });
      articleId = article?.id ?? null;
    }

    const existing = await prisma.helpFaq.findFirst({
      where: { audience: faq.audience, question: faq.question },
    });

    if (existing) {
      await prisma.helpFaq.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          keywords: faq.keywords,
          sortOrder: faq.sortOrder,
          published: true,
          articleId,
        },
      });
    } else {
      await prisma.helpFaq.create({
        data: {
          audience: faq.audience,
          question: faq.question,
          answer: faq.answer,
          keywords: faq.keywords,
          sortOrder: faq.sortOrder,
          published: true,
          articleId,
        },
      });
    }
  }
}
