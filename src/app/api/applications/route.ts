import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dbHealthCheck } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { queueJobApplicationNotification } from "@/lib/notifications";
import { storeResume } from "@/lib/storage/resume";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const applicationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  position: z.string().min(2).max(120),
  message: z.string().max(4000).optional(),
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const db = await dbHealthCheck();
  if (!db.ok) {
    return NextResponse.json(
      { ok: false, error: "Applications are temporarily unavailable. Please email joytogetherhomecare@gmail.com." },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const parsed = applicationSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone") || undefined,
    position: form.get("position"),
    message: form.get("message") || undefined,
    website: form.get("website") || "",
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check your application fields." }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const file = form.get("resume");
  const applicationId = randomUUID();

  const application = await prisma.jobApplication.create({
    data: {
      id: applicationId,
      fullName: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      position: parsed.data.position,
      message: parsed.data.message,
    },
  });

  if (file && file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES || !ALLOWED.has(file.type)) {
      await prisma.jobApplication.delete({ where: { id: application.id } });
      return NextResponse.json({ ok: false, error: "Resume must be PDF or Word under 5MB." }, { status: 400 });
    }
    try {
      const resumeKey = await storeResume(file, application.id);
      await prisma.jobApplication.update({
        where: { id: application.id },
        data: { resumeKey },
      });
    } catch {
      await prisma.jobApplication.delete({ where: { id: application.id } });
      return NextResponse.json({ ok: false, error: "Could not store resume. Please try again." }, { status: 500 });
    }
  }

  const resumeKeyAfterUpload = await prisma.jobApplication.findUnique({
    where: { id: application.id },
    select: { resumeKey: true },
  });

  try {
    await queueJobApplicationNotification({
      applicationId: application.id,
      fullName: application.fullName,
      position: application.position,
      email: application.email,
      phone: application.phone ?? undefined,
      hasResume: Boolean(resumeKeyAfterUpload?.resumeKey),
    });
  } catch {
    // Application is persisted; notification can be retried via cron.
  }

  await writeAuditLog({
    action: "CREATE",
    entity: "JobApplication",
    entityId: application.id,
    meta: { position: application.position },
  });

  return NextResponse.json({
    ok: true,
    message: "Thank you. Your application was received and our recruiting team will follow up.",
  });
}
