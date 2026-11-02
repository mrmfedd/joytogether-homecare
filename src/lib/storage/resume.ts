import { put, del, get } from "@vercel/blob";
import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";

const MAX_BYTES = 5 * 1024 * 1024;

export async function storeResume(file: File, applicationId: string): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("Resume exceeds 5MB limit.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const key = `resumes/${applicationId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, buffer, {
      access: "private",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type || "application/octet-stream",
    });
    return blob.pathname;
  }

  const dir = path.join(process.cwd(), "storage", "resumes");
  await mkdir(dir, { recursive: true });
  const filename = `${applicationId}.${ext}`;
  await writeFile(path.join(dir, filename), buffer, { mode: 0o600 });
  return `local:${filename}`;
}

export async function getResumeStream(storageKey: string): Promise<{ data: Buffer; contentType: string }> {
  if (storageKey.startsWith("local:")) {
    const filePath = path.join(process.cwd(), "storage", "resumes", storageKey.replace("local:", ""));
    const data = await readFile(filePath);
    const ext = path.extname(filePath).slice(1);
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword";
    return { data, contentType };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Blob storage not configured");
  }

  const result = await get(storageKey, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });
  const data = Buffer.from(await new Response(result.stream).arrayBuffer());
  const contentType = result.contentType || "application/octet-stream";
  return { data, contentType };
}

export async function deleteResume(storageKey: string) {
  if (storageKey.startsWith("local:")) {
    const filePath = path.join(process.cwd(), "storage", "resumes", storageKey.replace("local:", ""));
    await unlink(filePath).catch(() => undefined);
    return;
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(storageKey, { token: process.env.BLOB_READ_WRITE_TOKEN });
  }
}
