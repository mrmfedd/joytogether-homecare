"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PublicationStatus } from "@/generated/prisma";
import { requirePermission } from "@/lib/admin/require-permission";
import { writeAuditLog } from "@/lib/audit";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const pageSchema = z.object({
  key: z.string().min(2).max(120),
  title: z.string().min(2).max(200),
  bodyJson: z.string().min(2),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function savePageContentAction(formData: FormData) {
  const user = await requirePermission(canManageContent);
  const parsed = pageSchema.safeParse({
    key: formData.get("key"),
    title: formData.get("title"),
    bodyJson: formData.get("bodyJson"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  let body: unknown;
  try {
    body = JSON.parse(parsed.data.bodyJson);
  } catch {
    return;
  }

  const existing = await prisma.pageContent.findUnique({ where: { key: parsed.data.key } });
  const page = await prisma.pageContent.upsert({
    where: { key: parsed.data.key },
    create: {
      key: parsed.data.key,
      title: parsed.data.title,
      body: body as object,
      status: parsed.data.status as PublicationStatus,
    },
    update: {
      title: parsed.data.title,
      body: body as object,
      status: parsed.data.status as PublicationStatus,
    },
  });

  if (existing) {
    await prisma.contentRevision.create({
      data: {
        pageContentId: page.id,
        snapshot: existing.body as object,
        createdById: user.id,
      },
    });
  }

  await writeAuditLog({
    userId: user.id,
    action: existing ? "UPDATE" : "CREATE",
    entity: "PageContent",
    entityId: page.id,
    meta: { key: page.key, status: page.status },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${page.key}`);
  revalidatePath("/");
  return;
}

const faqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(5).max(300),
  answer: z.string().min(5).max(8000),
  displayOrder: z.coerce.number().int().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function saveFaqAction(formData: FormData) {
  const user = await requirePermission(canManageContent);
  const parsed = faqSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;

  const faq = parsed.data.id
    ? await prisma.fAQ.update({
        where: { id: parsed.data.id },
        data: {
          question: parsed.data.question,
          answer: parsed.data.answer,
          displayOrder: parsed.data.displayOrder,
          status: parsed.data.status as PublicationStatus,
        },
      })
    : await prisma.fAQ.create({
        data: {
          question: parsed.data.question,
          answer: parsed.data.answer,
          displayOrder: parsed.data.displayOrder,
          status: parsed.data.status as PublicationStatus,
        },
      });

  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "FAQ", entityId: faq.id });
  revalidatePath("/admin/content");
  return;
}

export async function deleteFaqAction(formData: FormData) {
  const user = await requirePermission(canManageContent);
  const id = String(formData.get("id") || "");
  await prisma.fAQ.delete({ where: { id } });
  await writeAuditLog({ userId: user.id, action: "DELETE", entity: "FAQ", entityId: id });
  revalidatePath("/admin/content");
  return;
}
