import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { servicesContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Our Services",
  description: servicesContent.intro,
};

const additionalIds = new Set([
  "meals",
  "regardless",
  "lifestyle",
  "family",
  "care-plans",
  "hospice",
]);

export default function ServicesPage() {
  const additional = servicesContent.offerings.filter((o) => additionalIds.has(o.id));

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Flexible Care for Life's Changing Needs"
        description={servicesContent.intro}
        cta={{ label: "Request a Free Consultation →", href: "/contact" }}
      />

      <section className="section-pad bg-purple-50">
        <div className="site-container">
          <h2 className="font-display m-0 mb-8 text-3xl">Core services</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                id: "companionship",
                title: "Companion Care",
                description: servicesContent.offerings.find((o) => o.id === "companionship")?.description,
              },
              {
                id: "personal-care",
                title: "Personal Care",
                description:
                  "Respectful assistance with bathing, dressing, grooming, medication reminders, and daily routines.",
              },
              {
                id: "housekeeping",
                title: "Light Household Help",
                description: servicesContent.offerings.find((o) => o.id === "housekeeping")?.description,
              },
              {
                id: "respite",
                title: "Respite Care",
                description:
                  "Temporary support that gives family caregivers time to rest while your loved one receives attentive care.",
              },
            ].map((service) => (
              <article key={service.id} id={service.id} className="card-soft scroll-mt-28 p-8">
                <h3 className="font-display m-0 text-2xl">{service.title}</h3>
                <p className="body-muted mt-3 text-sm">{service.description}</p>
                <Link
                  href="/contact"
                  className="mt-5 inline-block text-sm font-bold text-purple-700 hover:text-purple-900"
                >
                  Request this service →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="site-container">
          <h2 className="font-display m-0 mb-8 text-3xl">Additional support</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {additional.map((service) => (
              <article key={service.id} id={service.id} className="card-soft scroll-mt-28 p-6">
                <h3 className="font-display m-0 text-xl">{service.title}</h3>
                <p className="body-muted mt-2 text-sm">{service.description}</p>
                <Link
                  href="/contact"
                  className="mt-4 inline-block text-sm font-bold text-purple-700"
                >
                  Learn More →
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href="/contact" variant="purple">Start Your Care Plan →</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
