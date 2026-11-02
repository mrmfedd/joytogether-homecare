import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceLandingPage } from "@/components/services/ServiceLandingPage";
import { getServiceLanding, serviceLandings } from "@/content/careServices";
import { getPublishedServiceBySlug } from "@/lib/content/public";

export function generateStaticParams() {
  return serviceLandings.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const staticService = getServiceLanding(slug);
  const fromDb = await getPublishedServiceBySlug(slug);
  if (!staticService && !fromDb) return {};
  return {
    title: fromDb?.seoTitle ?? staticService?.seoTitle,
    description: fromDb?.seoDescription ?? staticService?.seoDescription,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const staticService = getServiceLanding(slug);
  if (!staticService) notFound();

  const fromDb = await getPublishedServiceBySlug(slug);
  const service = fromDb
    ? {
        ...staticService,
        title: fromDb.title,
        intro: fromDb.intro,
        image: fromDb.image ?? staticService.image,
        seoTitle: fromDb.seoTitle ?? staticService.seoTitle,
        seoDescription: fromDb.seoDescription ?? staticService.seoDescription,
      }
    : staticService;

  return <ServiceLandingPage service={service} />;
}
