"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HelpAudience, UserRole } from "@/generated/prisma";
import { requireAdminSession } from "@/lib/auth";
import { canManageHelpContent } from "@/lib/help/access";
import { prisma } from "@/lib/prisma";

async function requireHelpEditor() {
  const user = await requireAdminSession();
  if (!user || !canManageHelpContent(user.role)) redirect("/admin/help");
  return user;
}

export async function upsertHelpCategoryAction(formData: FormData) {
  const user = await requireHelpEditor();
  const id = String(formData.get("id") || "").trim();
  const audience = String(formData.get("audience")) as HelpAudience;
  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!slug || !title || (audience !== "ADMIN" && audience !== "EMPLOYEE")) {
    return { error: "Invalid category data." };
  }

  if (id) {
    await prisma.helpCategory.update({
      where: { id },
      data: { slug, title, summary, sortOrder, audience },
    });
  } else {
    await prisma.helpCategory.create({
      data: { audience, slug, title, summary, sortOrder },
    });
  }

  revalidatePath("/admin/help/manage");
  revalidatePath("/admin/help");
  revalidatePath("/employee/help");
  return { ok: true, editorId: user.id };
}

export async function saveHelpArticleAction(formData: FormData) {
  const user = await requireHelpEditor();
  const id = String(formData.get("id") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim() || null;
  const content = String(formData.get("content") || "").trim();
  const keywordsRaw = String(formData.get("keywords") || "").trim();
  const contextRoutesRaw = String(formData.get("contextRoutes") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const published = formData.get("published") === "on";
  const changeNote = String(formData.get("changeNote") || "").trim() || null;
  const allowedRolesRaw = String(formData.get("allowedRoles") || "").trim();

  const keywords = keywordsRaw
    ? keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean)
    : [];
  const contextRoutes = contextRoutesRaw
    ? contextRoutesRaw.split(",").map((r) => r.trim()).filter(Boolean)
    : [];
  const allowedRoles = allowedRolesRaw
    ? (allowedRolesRaw.split(",").map((r) => r.trim()).filter(Boolean) as UserRole[])
    : [];

  if (!categoryId || !slug || !title || !content) {
    return { error: "Title, slug, category, and content are required." };
  }

  if (id) {
    const existing = await prisma.helpArticle.findUnique({ where: { id } });
    if (!existing) return { error: "Article not found." };

    await prisma.$transaction([
      prisma.helpArticleRevision.create({
        data: {
          articleId: id,
          title: existing.title,
          content: existing.content,
          summary: existing.summary,
          editorId: user.id,
          changeNote: changeNote || "Saved before edit",
        },
      }),
      prisma.helpArticle.update({
        where: { id },
        data: {
          categoryId,
          slug,
          title,
          summary,
          content,
          keywords,
          contextRoutes,
          allowedRoles,
          sortOrder,
          published,
          lastReviewedAt: new Date(),
        },
      }),
    ]);
  } else {
    await prisma.helpArticle.create({
      data: {
        categoryId,
        slug,
        title,
        summary,
        content,
        keywords,
        contextRoutes,
        allowedRoles,
        sortOrder,
        published,
        lastReviewedAt: new Date(),
      },
    });
  }

  revalidatePath("/admin/help/manage");
  revalidatePath("/admin/help");
  revalidatePath("/employee/help");
  return { ok: true };
}

export async function toggleHelpArticlePublishedAction(formData: FormData) {
  await requireHelpEditor();
  const id = String(formData.get("id") || "").trim();
  const published = formData.get("published") === "true";
  await prisma.helpArticle.update({ where: { id }, data: { published } });
  revalidatePath("/admin/help/manage");
  revalidatePath("/admin/help");
  revalidatePath("/employee/help");
}

export async function saveHelpFaqAction(formData: FormData) {
  await requireHelpEditor();
  const id = String(formData.get("id") || "").trim();
  const audience = String(formData.get("audience")) as HelpAudience;
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const published = formData.get("published") === "on";
  const articleId = String(formData.get("articleId") || "").trim() || null;

  if (!question || !answer) return { error: "Question and answer required." };

  if (id) {
    await prisma.helpFaq.update({
      where: { id },
      data: { audience, question, answer, sortOrder, published, articleId },
    });
  } else {
    await prisma.helpFaq.create({
      data: { audience, question, answer, sortOrder, published, articleId },
    });
  }

  revalidatePath("/admin/help/manage");
  revalidatePath("/admin/help");
  revalidatePath("/employee/help");
}
