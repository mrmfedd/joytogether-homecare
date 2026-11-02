import { CareDiscovery } from "@/components/home/CareDiscovery";
import { CinematicHero } from "@/components/home/CinematicHero";
import { EmotionalConnection } from "@/components/home/EmotionalConnection";
import { FinalCta } from "@/components/home/FinalCta";
import { HowCareBegins } from "@/components/home/HowCareBegins";
import { MajorCarePanels } from "@/components/home/MajorCarePanels";
import { PartnersSection } from "@/components/home/PartnersSection";
import { PrivateDutyFeature } from "@/components/home/PrivateDutyFeature";
import { ServiceAreas } from "@/components/home/ServiceAreas";
import { TampaReviewsSection } from "@/components/home/TampaReviewsSection";
import { WhyFamilies } from "@/components/home/WhyFamilies";
import { getPublishedPageBody } from "@/lib/content/public";

const defaultHero = {
  headline: "The Art of Caring.",
  subheadline: "Compassion That Feels Like Family. Care That Feels Like Home.",
  primaryCta: "Request a Free Consultation",
  secondaryCta: "Explore Our Services",
};

export default async function HomePage() {
  const hero = await getPublishedPageBody("homepage.hero", defaultHero);

  return (
    <>
      <CinematicHero
        headline={hero.headline}
        subheadline={hero.subheadline}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
      />
      <EmotionalConnection />
      <MajorCarePanels />
      <PrivateDutyFeature />
      <WhyFamilies />
      <CareDiscovery />
      <TampaReviewsSection />
      <HowCareBegins />
      <PartnersSection />
      <ServiceAreas />
      <FinalCta />
    </>
  );
}
