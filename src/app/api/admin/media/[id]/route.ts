import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { deleteMediaFile, mediaPublicPath } from "@/lib/storage/media";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { altText?: string };
  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: { altText: body.altText?.slice(0, 300) ?? null },
  });

  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "MediaAsset", entityId: id });
  return NextResponse.json({ ok: true, item: { ...asset, url: mediaPublicPath(asset.id) } });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.testimonial.updateMany({ where: { mediaAssetId: id }, data: { mediaAssetId: null } });
  await prisma.mediaAsset.delete({ where: { id } });
  await deleteMediaFile(asset.storageKey).catch(() => undefined);
  await writeAuditLog({ userId: user.id, action: "DELETE", entity: "MediaAsset", entityId: id });

  return NextResponse.json({ ok: true });
}
