import type { PublicationStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { serviceLandings } from "@/content/careServices";

export async function getPublishedPageBody<T>(key: string, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    const page = await prisma.pageContent.findUnique({ where: { key } });
    if (page?.status === "PUBLISHED" && page.body) {
      return page.body as T;
    }
  } catch {
    /* fallback */
  }
  return fallback;
}

export async function getPageBodyForPreview<T>(
  key: string,
  fallback: T,
  mode: "published" | "draft",
): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    const page = await prisma.pageContent.findUnique({ where: { key } });
    if (!page?.body) return fallback;
    if (mode === "draft" && page.status !== "ARCHIVED") return page.body as T;
    if (mode === "published" && page.status === "PUBLISHED") return page.body as T;
  } catch {
    /* fallback */
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

export async function listPublishedFaqs() {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await prisma.fAQ.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function listPublishedTestimonials() {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await prisma.testimonial.findMany({
      where: { status: "PUBLISHED", permissionRecorded: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function listPublishedServices() {
  if (!process.env.DATABASE_URL) {
    return serviceLandings.map((s) => ({
      slug: s.slug,
      name: s.title,
      description: s.intro,
      featuredImage: s.image,
      category: s.category,
    }));
  }
  try {
    const rows = await prisma.service.findMany({
      where: { status: "PUBLISHED", visible: true },
      orderBy: { displayOrder: "asc" },
    });
    if (rows.length === 0) {
      return serviceLandings.map((s) => ({
        slug: s.slug,
        name: s.title,
        description: s.intro,
        featuredImage: s.image,
        category: s.category,
      }));
    }
    return rows;
  } catch {
    return serviceLandings.map((s) => ({
      slug: s.slug,
      name: s.title,
      description: s.intro,
      featuredImage: s.image,
      category: s.category,
    }));
  }
}

export async function getPublishedServiceBySlug(slug: string) {
  const staticLanding = serviceLandings.find((s) => s.slug === slug);
  if (!process.env.DATABASE_URL) return staticLanding ?? null;
  try {
    const row = await prisma.service.findUnique({ where: { slug } });
    if (row && row.status === "PUBLISHED" && row.visible && staticLanding) {
      return {
        ...staticLanding,
        title: row.name,
        intro: row.description,
        image: row.featuredImage || staticLanding.image,
        seoTitle: row.seoTitle || staticLanding.seoTitle,
        seoDescription: row.seoDescription || staticLanding.seoDescription,
      };
    }
  } catch {
    /* fallback */
  }
  return staticLanding ?? null;
}

export type { PublicationStatus };
