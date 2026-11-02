"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PublicationStatus } from "@/generated/prisma";
import { requirePermission } from "@/lib/admin/require-permission";
import { writeAuditLog } from "@/lib/audit";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  quote: z.string().min(10).max(4000),
  authorName: z.string().min(2).max(120),
  authorRole: z.string().max(120).optional(),
  permissionRecorded: z.enum(["on", "off"]).optional().transform((v) => v === "on"),
  permissionNote: z.string().max(500).optional(),
  displayOrder: z.coerce.number().int().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function saveTestimonialAction(formData: FormData) {
  const user = await requirePermission(canManageContent);
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false as const, error: "Invalid testimonial" };

  if (parsed.data.status === "PUBLISHED" && !parsed.data.permissionRecorded) {
    return { ok: false as const, error: "Record permission before publishing." };
  }

  const data = {
    quote: parsed.data.quote,
    authorName: parsed.data.authorName,
    authorRole: parsed.data.authorRole || null,
    permissionRecorded: parsed.data.permissionRecorded,
    permissionNote: parsed.data.permissionNote || null,
    displayOrder: parsed.data.displayOrder,
    status: parsed.data.status as PublicationStatus,
  };

  const testimonial = parsed.data.id
    ? await prisma.testimonial.update({ where: { id: parsed.data.id }, data })
    : await prisma.testimonial.create({ data });

  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "Testimonial", entityId: testimonial.id });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { ok: true as const, id: testimonial.id };
}

export async function archiveTestimonialAction(formData: FormData) {
  const user = await requirePermission(canManageContent);
  const id = String(formData.get("id") || "");
  await prisma.testimonial.update({ where: { id }, data: { status: "ARCHIVED" } });
  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "Testimonial", entityId: id });
  revalidatePath("/admin/testimonials");
  return { ok: true as const };
}
