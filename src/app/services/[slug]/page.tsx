import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceLandingPage } from "@/components/services/ServiceLandingPage";
import { getServiceLanding, serviceLandings } from "@/content/careServices";

export function generateStaticParams() {
  return serviceLandings.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceLanding(slug);
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceLanding(slug);
  if (!service) notFound();
  return <ServiceLandingPage service={service} />;
}
