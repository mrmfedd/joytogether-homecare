import { notFound } from "next/navigation";
import { getPageBodyForPreview } from "@/lib/content/public";
import { verifyPreviewToken } from "@/lib/content/preview";
import { CinematicHero } from "@/components/home/CinematicHero";
import { PageHero } from "@/components/layout/PageHero";

const defaultHero = {
  headline: "The Art of Caring.",
  subheadline: "Compassion That Feels Like Family. Care That Feels Like Home.",
  primaryCta: "Request a Free Consultation",
  secondaryCta: "Explore Our Services",
};

const defaultServicesHub = {
  eyebrow: "Our Services",
  title: "Care Pathways for Every Family Journey",
  description:
    "JoyTogether Home Care provides skilled nursing, hospice care, and private duty options — plus practical nonmedical support that helps people remain comfortable at home.",
  ctaLabel: "Request a Free Consultation →",
  ctaHref: "/contact",
};

export default async function PreviewContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { key: rawKey } = await params;
  const { token } = await searchParams;
  const key = decodeURIComponent(rawKey);

  if (!token || !verifyPreviewToken(key, token)) {
    notFound();
  }

  const body =
    key === "homepage.hero"
      ? await getPageBodyForPreview(key, defaultHero, "draft")
      : key === "services.hub"
        ? await getPageBodyForPreview(key, defaultServicesHub, "draft")
        : await getPageBodyForPreview(key, {}, "draft");

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
        Draft preview — {key} — not visible to the public until published
      </div>
      {key === "homepage.hero" ? (
        <CinematicHero
          headline={(body as typeof defaultHero).headline}
          subheadline={(body as typeof defaultHero).subheadline}
          primaryCta={(body as typeof defaultHero).primaryCta}
          secondaryCta={(body as typeof defaultHero).secondaryCta}
          imageSrc={(body as { imageUrl?: string }).imageUrl || undefined}
          imageAlt={(body as { imageAlt?: string }).imageAlt || ""}
        />
      ) : key === "services.hub" ? (
        <PageHero
          eyebrow={(body as typeof defaultServicesHub).eyebrow}
          title={(body as typeof defaultServicesHub).title}
          description={(body as typeof defaultServicesHub).description}
          cta={{
            label: (body as typeof defaultServicesHub).ctaLabel,
            href: (body as typeof defaultServicesHub).ctaHref,
          }}
        />
      ) : (
        <pre className="site-container py-8 text-xs">{JSON.stringify(body, null, 2)}</pre>
      )}
    </div>
  );
}
