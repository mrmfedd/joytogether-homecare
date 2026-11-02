import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ServicesExplorer } from "@/components/services/ServicesExplorer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { servicesHeadline } from "@/content/servicesCatalog";
import { servicesContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Our Services",
  description: servicesHeadline,
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={servicesHeadline}
        description={servicesContent.intro}
        cta={{ label: "Request a Free Consultation →", href: "/contact" }}
      />

      <ServicesExplorer />

      <section className="section-pad text-center">
        <div className="site-container">
          <ButtonLink href="/contact" variant="purple">
            Start Your Care Plan →
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
