import { prisma } from "@/lib/prisma";

export async function getPublishedPageBody<T>(key: string, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    const page = await prisma.pageContent.findUnique({ where: { key } });
    if (page?.status === "PUBLISHED" && page.body) {
      return page.body as T;
    }
  } catch {
    // fall back to static content when DB unavailable
  }
  return fallback;
}

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (row?.value !== undefined) return row.value as T;
  } catch {
    /* ignore */
  }
  return fallback;
}
