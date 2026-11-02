import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMediaStream } from "@/lib/storage/media";

/** Public delivery for marketing media (files remain private in Blob). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset || !asset.mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, contentType } = await getMediaStream(asset.storageKey);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": asset.mimeType || contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Disposition": `inline; filename="${asset.filename.replace(/[^a-z0-9._-]+/gi, "_")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 404 });
  }
}
