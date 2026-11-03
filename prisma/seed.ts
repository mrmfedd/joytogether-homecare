import "dotenv/config";
import { PrismaClient, PublicationStatus, type Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { serviceLandings } from "../src/content/careServices";
import { site } from "../src/content/site";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL required for seed");
  const pool = new pg.Pool({ connectionString, ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false } });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

const defaultSettings: Record<string, unknown> = {
  businessName: site.name,
  phone: site.contact.phone,
  email: site.contact.email,
  address: site.contact.address,
  serviceArea: site.contact.serviceArea,
  legacyUrl: site.legacyUrl,
};

const serviceAreas = [
  { name: "Apollo Beach", slug: "apollo-beach", description: "Primary service area for JoyTogether Home Care." },
  { name: "Hillsborough County", slug: "hillsborough-county", description: "Greater Tampa Bay region." },
  { name: "Manatee County", slug: "manatee-county", description: "Bradenton and surrounding communities." },
];

async function main() {
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value as Prisma.InputJsonValue, sensitive: key === "email" },
      update: { value: value as Prisma.InputJsonValue },
    });
  }

  for (const [index, s] of serviceLandings.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.title,
        category: s.category,
        description: s.intro,
        displayOrder: index,
        featuredImage: s.image,
        visible: true,
        status: PublicationStatus.PUBLISHED,
        seoTitle: s.seoTitle,
        seoDescription: s.seoDescription,
        clinicalLocked: s.category === "clinical" || s.category === "hospice",
      },
      update: {
        name: s.title,
        description: s.intro,
        seoTitle: s.seoTitle,
        seoDescription: s.seoDescription,
      },
    });
  }

  for (const area of serviceAreas) {
    await prisma.serviceArea.upsert({
      where: { slug: area.slug },
      create: { ...area, visible: true },
      update: { name: area.name, description: area.description },
    });
  }

  await prisma.pageContent.upsert({
    where: { key: "homepage.hero" },
    create: {
      key: "homepage.hero",
      title: "Homepage Hero",
      status: PublicationStatus.PUBLISHED,
      body: {
        headline: "THE ART OF CARING.",
        subheadline: "Compassion That Feels Like Family. Care That Feels Like Home.",
        primaryCta: "Request a Free Consultation",
        secondaryCta: "Explore Our Services",
      },
    },
    update: {},
  });

  await prisma.pageContent.upsert({
    where: { key: "services.hub" },
    create: {
      key: "services.hub",
      title: "Services Hub Hero",
      status: PublicationStatus.PUBLISHED,
      body: {
        eyebrow: "Our Services",
        title: "Care Pathways for Every Family Journey",
        description:
          "JoyTogether Home Care provides skilled nursing, hospice care, and private duty options — plus practical nonmedical support that helps people remain comfortable at home.",
        ctaLabel: "Request a Free Consultation →",
        ctaHref: "/contact",
      },
    },
    update: {},
  });

  const defaultFaqs = [
    {
      question: "What areas do you serve?",
      answer:
        "JoyTogether Home Care is based in Apollo Beach and supports families across the Greater Tampa Bay area. Coverage for a specific address is confirmed during consultation.",
    },
    {
      question: "How do I request a free consultation?",
      answer:
        "Use the contact form on our website or call us. A care coordinator will follow up to discuss needs — this is a nonclinical marketing inquiry, not medical advice.",
    },
    {
      question: "Do you offer skilled nursing and hospice support?",
      answer:
        "We provide pathways for skilled nursing, hospice care, and private duty options. Clinical services are delivered by appropriately licensed professionals after assessment.",
    },
  ];

  for (const [index, faq] of defaultFaqs.entries()) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: { answer: faq.answer, displayOrder: index, status: PublicationStatus.PUBLISHED },
      });
    } else {
      await prisma.fAQ.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          displayOrder: index,
          status: PublicationStatus.PUBLISHED,
        },
      });
    }
  }

  if (process.env.SEED_DEV_EXAMPLES === "true") {
    console.log("SEED_DEV_EXAMPLES enabled — skipping fictional leads/testimonials by policy.");
  }

  console.log("Seed complete (settings, services, service areas, homepage, FAQs).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
