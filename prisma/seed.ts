import { PrismaClient, PublicationStatus } from "../src/generated/prisma";
import { serviceLandings } from "../src/content/careServices";
import { site } from "../src/content/site";

const prisma = new PrismaClient();

const defaultSettings: Record<string, unknown> = {
  businessName: site.name,
  phone: site.contact.phone,
  email: site.contact.email,
  address: site.contact.address,
  serviceArea: site.contact.serviceArea,
  legacyUrl: site.legacyUrl,
};

async function main() {
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value, sensitive: key === "email" },
      update: { value },
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

  console.log("Seed complete (services, settings, homepage content). No fictional leads/testimonials seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
