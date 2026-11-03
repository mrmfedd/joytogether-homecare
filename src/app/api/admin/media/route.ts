import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { mediaPublicPath, storeMediaFile } from "@/lib/storage/media";

export async function GET() {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    items: items.map((m) => ({
      ...m,
      url: mediaPublicPath(m.id),
    })),
  });
}

export async function POST(req: Request) {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const altText = String(form.get("altText") || "").slice(0, 300);
  const replaceId = String(form.get("replaceId") || "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }

  try {
    const stored = await storeMediaFile(file);

    let asset;
    if (replaceId) {
      const existing = await prisma.mediaAsset.findUnique({ where: { id: replaceId } });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const { deleteMediaFile } = await import("@/lib/storage/media");
      await deleteMediaFile(existing.storageKey).catch(() => undefined);

      asset = await prisma.mediaAsset.update({
        where: { id: replaceId },
        data: {
          filename: stored.filename,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes,
          storageKey: stored.storageKey,
          altText: altText || existing.altText,
          uploadedById: user.id,
        },
      });
    } else {
      asset = await prisma.mediaAsset.create({
        data: {
          filename: stored.filename,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes,
          storageKey: stored.storageKey,
          altText: altText || null,
          uploadedById: user.id,
        },
      });
    }

    await writeAuditLog({
      userId: user.id,
      action: replaceId ? "UPDATE" : "CREATE",
      entity: "MediaAsset",
      entityId: asset.id,
    });

    return NextResponse.json({
      ok: true,
      item: { ...asset, url: mediaPublicPath(asset.id) },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 400 },
    );
  }
}
