"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PublicationStatus } from "@/generated/prisma";
import { requirePermission } from "@/lib/admin/require-permission";
import { writeAuditLog } from "@/lib/audit";
import { canApproveClinicalCopy, canManageServices } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  category: z.string().min(2).max(80),
  description: z.string().min(10).max(8000),
  displayOrder: z.coerce.number().int().min(0).max(999),
  featuredImage: z.string().max(500).optional(),
  visible: z.enum(["on", "off"]).optional().transform((v) => v === "on"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(300).optional(),
});

export async function saveServiceAction(formData: FormData) {
  const user = await requirePermission(canManageServices);
  const raw = Object.fromEntries(formData.entries());
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message || "Invalid input" };

  const existing = parsed.data.id
    ? await prisma.service.findUnique({ where: { id: parsed.data.id } })
    : null;
  if (existing?.clinicalLocked && !canApproveClinicalCopy(user.role)) {
    return { ok: false as const, error: "Clinical service copy requires admin approval." };
  }

  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    category: parsed.data.category,
    description: parsed.data.description,
    displayOrder: parsed.data.displayOrder,
    featuredImage: parsed.data.featuredImage || null,
    visible: parsed.data.visible,
    status: parsed.data.status as PublicationStatus,
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
  };

  const service = parsed.data.id
    ? await prisma.service.update({ where: { id: parsed.data.id }, data })
    : await prisma.service.create({ data });

  await writeAuditLog({
    userId: user.id,
    action: parsed.data.id ? "UPDATE" : "CREATE",
    entity: "Service",
    entityId: service.id,
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true as const, id: service.id };
}

export async function archiveServiceAction(formData: FormData) {
  const user = await requirePermission(canManageServices);
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false as const, error: "Missing id" };
  await prisma.service.update({ where: { id }, data: { status: "ARCHIVED", visible: false } });
  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "Service", entityId: id, meta: { status: "ARCHIVED" } });
  revalidatePath("/admin/services");
  return { ok: true as const };
}
