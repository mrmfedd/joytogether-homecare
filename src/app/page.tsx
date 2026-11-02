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

export default function HomePage() {
  return (
    <>
      <CinematicHero />
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
