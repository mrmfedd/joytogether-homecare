"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/admin/require-permission";
import { writeAuditLog } from "@/lib/audit";
import { canManageServices } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const areaSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  description: z.string().max(4000).optional(),
  visible: z.enum(["on", "off"]).optional().transform((v) => v === "on"),
});

export async function saveServiceAreaAction(formData: FormData) {
  const user = await requirePermission(canManageServices);
  const parsed = areaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;

  const area = parsed.data.id
    ? await prisma.serviceArea.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description || null,
          visible: parsed.data.visible,
        },
      })
    : await prisma.serviceArea.create({
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description || null,
          visible: parsed.data.visible,
        },
      });

  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "ServiceArea", entityId: area.id });
  revalidatePath("/admin/service-areas");
  return;
}

export async function linkServiceAreaAction(formData: FormData) {
  const user = await requirePermission(canManageServices);
  const serviceId = String(formData.get("serviceId") || "");
  const serviceAreaId = String(formData.get("serviceAreaId") || "");
  const linked = formData.getAll("linked").includes("on");

  if (!serviceId || !serviceAreaId) return;

  if (linked) {
    await prisma.serviceOnArea.upsert({
      where: { serviceId_serviceAreaId: { serviceId, serviceAreaId } },
      create: { serviceId, serviceAreaId },
      update: {},
    });
  } else {
    await prisma.serviceOnArea.deleteMany({ where: { serviceId, serviceAreaId } });
  }

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "ServiceOnArea",
    meta: { serviceId, serviceAreaId, linked },
  });
  revalidatePath("/admin/service-areas");
  return;
}
