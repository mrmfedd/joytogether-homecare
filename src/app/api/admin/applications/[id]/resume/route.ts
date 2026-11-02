import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { canManageCareers } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

  const filePath = path.join(process.cwd(), "storage", "resumes", application.resumeKey);
  try {
    const data = await readFile(filePath);
    const ext = path.extname(application.resumeKey).slice(1);
    const type =
      ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword";
    return new NextResponse(data, {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${application.fullName.replace(/[^a-z0-9-_]+/gi, "_")}-resume.${ext}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
