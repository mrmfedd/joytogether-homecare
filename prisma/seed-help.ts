import type { PrismaClient } from "../src/generated/prisma";
import { helpSeedCategories, helpSeedFaqs } from "../src/content/help/seed-data";

const HELP_REVIEWED_AT = new Date("2026-11-23T12:00:00Z");

/** Questions replaced when authenticator MFA was removed. Matched by exact text, so upsert cannot update them. */
const RETIRED_FAQ_QUESTIONS = [
  "How do I enable MFA for my ADMIN account?",
  "How do I enable MFA on my employee account?",
];

export async function seedHelpCenter(prisma: PrismaClient) {
  if (RETIRED_FAQ_QUESTIONS.length > 0) {
    await prisma.helpFaq.deleteMany({
      where: { question: { in: [...RETIRED_FAQ_QUESTIONS] } },
    });
  }

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
          lastReviewedAt: HELP_REVIEWED_AT,
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
          lastReviewedAt: HELP_REVIEWED_AT,
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
