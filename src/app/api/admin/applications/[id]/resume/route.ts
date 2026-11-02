import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { canManageCareers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getResumeStream } from "@/lib/storage/resume";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canManageCareers(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const application = await prisma.jobApplication.findUnique({ where: { id } });
  if (!application?.resumeKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { data, contentType } = await getResumeStream(application.resumeKey);
    const ext = application.resumeKey.includes(".") ? application.resumeKey.split(".").pop() : "pdf";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${application.fullName.replace(/[^a-z0-9-_]+/gi, "_")}-resume.${ext}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
