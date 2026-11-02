"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ApplicantStatus, PublicationStatus } from "@/generated/prisma";
import { requirePermission } from "@/lib/admin/require-permission";
import { writeAuditLog } from "@/lib/audit";
import { canManageCareers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const jobSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(12000),
  location: z.string().max(120).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function saveJobPostingAction(formData: FormData) {
  const user = await requirePermission(canManageCareers);
  const parsed = jobSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false as const, error: "Invalid job posting" };

  const job = parsed.data.id
    ? await prisma.jobPosting.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: parsed.data.description,
          location: parsed.data.location || null,
          status: parsed.data.status as PublicationStatus,
        },
      })
    : await prisma.jobPosting.create({
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: parsed.data.description,
          location: parsed.data.location || null,
          status: parsed.data.status as PublicationStatus,
        },
      });

  await writeAuditLog({
    userId: user.id,
    action: parsed.data.id ? "UPDATE" : "CREATE",
    entity: "JobPosting",
    entityId: job.id,
  });
  revalidatePath("/admin/careers");
  revalidatePath("/apply");
  return { ok: true as const, id: job.id };
}

export async function updateApplicationStatusAction(formData: FormData) {
  const user = await requirePermission(canManageCareers);
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ApplicantStatus;
  if (!id) return { ok: false as const, error: "Missing application" };

  await prisma.jobApplication.update({
    where: { id },
    data: { status, reviewerId: user.id },
  });
  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "JobApplication", entityId: id, meta: { status } });
  revalidatePath("/admin/careers");
  return { ok: true as const };
}
