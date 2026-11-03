import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { ServicesExplorer } from "@/components/services/ServicesExplorer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { majorCareExperiences } from "@/content/careServices";
import { getPublishedPageBody, listPublishedServices } from "@/lib/content/public";

const defaultServicesHub = {
  eyebrow: "Our Services",
  title: "Care Pathways for Every Family Journey",
  description:
    "JoyTogether Home Care provides skilled nursing, hospice care, and private duty options — plus practical nonmedical support that helps people remain comfortable at home.",
  ctaLabel: "Request a Free Consultation →",
  ctaHref: "/contact",
};

export const metadata: Metadata = {
  title: "Our Services | Skilled Nursing, Hospice & Private Duty",
  description:
    "Explore JoyTogether Home Care services including skilled nursing, hospice care, private duty care, personal care, companionship, respite, and transportation support.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  await connection();
  const hub = await getPublishedPageBody("services.hub", defaultServicesHub);
  const publishedServices = await listPublishedServices();
  const supportServices = publishedServices.filter((s) => s.category === "support");

  return (
    <>
      <PageHero
        eyebrow={hub.eyebrow}
        title={hub.title}
        description={hub.description}
        cta={{ label: hub.ctaLabel, href: hub.ctaHref }}
      />

      <section className="section-pad bg-white">
        <div className="site-container">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display m-0 text-3xl text-purple-900">Primary Care Experiences</h2>
            <p className="body-muted mt-3">
              Start with the pathway that best matches what you are exploring. Clinical care stays
              distinct from private-pay and nonmedical support.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {majorCareExperiences.map((item, i) => (
              <Reveal key={item.id} delay={i * 80}>
                <Link
                  href={item.href}
                  className="group block overflow-hidden rounded-[1.5rem] border border-line bg-cream shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div className="relative h-44">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="360px" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display m-0 text-xl text-purple-900">{item.title}</h3>
                    <p className="body-muted mt-2 text-sm">{item.tagline}</p>
                    <span className="mt-3 inline-block text-sm font-bold text-[var(--royal)]">
                      View details →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-sky">
        <div className="site-container">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display m-0 text-3xl text-purple-900">Additional Support Services</h2>
            <p className="body-muted mt-3">
              Practical nonmedical services that complement clinical and private duty pathways.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supportServices.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-bold text-purple-900 shadow-sm hover:border-[var(--royal)]"
              >
                {s.name} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ServicesExplorer />

      <section className="section-pad text-center">
        <div className="site-container">
          <ButtonLink href="/contact" variant="gold" className="uppercase tracking-wide">
            Start With a Consultation →
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
