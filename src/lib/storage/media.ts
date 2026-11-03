import { randomUUID } from "crypto";
import { del, get, put } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function mediaPublicPath(id: string) {
  return `/api/media/${id}`;
}

export async function storeMediaFile(file: File): Promise<{
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}> {
  if (file.size > MAX_BYTES) throw new Error("Image exceeds 8MB limit.");
  if (!ALLOWED.has(file.type)) throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed.");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const id = randomUUID();
  const storageKey = `media/${id}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.slice(0, 200);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(storageKey, buffer, {
      access: "private",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });
  } else {
    const dir = path.join(process.cwd(), "storage", "media");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.${ext}`), buffer, { mode: 0o600 });
  }

  return { storageKey, filename, mimeType: file.type, sizeBytes: file.size };
}

export async function getMediaStream(storageKey: string): Promise<{ data: Buffer; contentType: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN || storageKey.startsWith("local:")) {
    const name = storageKey.replace(/^local:/, "").replace(/^media\//, "");
    const filePath = path.join(process.cwd(), "storage", "media", name);
    const data = await readFile(filePath);
    return { data, contentType: "application/octet-stream" };
  }

  const result = await get(storageKey, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });
  if (!result || result.statusCode !== 200) throw new Error("Media unavailable");
  const data = Buffer.from(await new Response(result.stream).arrayBuffer());
  return { data, contentType: result.blob.contentType || "application/octet-stream" };
}

export async function deleteMediaFile(storageKey: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN && storageKey.startsWith("media/")) {
    await del(storageKey, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }
  const name = storageKey.replace(/^media\//, "").replace(/^local:/, "");
  await unlink(path.join(process.cwd(), "storage", "media", name)).catch(() => undefined);
}
