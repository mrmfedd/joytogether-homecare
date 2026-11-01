import type { Metadata } from "next";
import { MarketingImage } from "@/components/services/MarketingImage";
import { PageHero } from "@/components/layout/PageHero";
import { ContentSection } from "@/components/layout/ContentSection";
import { liveMission } from "@/content/liveSite";

export const metadata: Metadata = {
  title: "Our Mission",
  description: "Vision, mission, goals, and core values of JoyTogether Home Care.",
};

export default function OurMissionPage() {
  const m = liveMission;

  return (
    <>
      <PageHero eyebrow="Our Mission" title={m.title} />
      <section className="section-pad">
        <div className="site-container min-w-0 space-y-10">
          <div className="min-w-0 lg:hidden">
            <MarketingImage
              src="/assets/services/vision-mission.png"
              alt="Joy Together caregivers supporting clients at home"
            />
          </div>
          <div className="grid min-w-0 items-start gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <h2 className="font-display m-0 mb-4 text-2xl uppercase text-purple-900">Our vision</h2>
              <p className="body-muted">{m.vision}</p>
              <h2 className="font-display mt-8 mb-4 text-2xl uppercase text-purple-900">Our mission</h2>
              <p className="body-muted">{m.mission}</p>
              {m.missionParagraphs.map((p) => (
                <p key={p.slice(0, 40)} className="body-muted mt-4">
                  {p}
                </p>
              ))}
            </div>
            <div className="hidden min-w-0 lg:block">
              <MarketingImage
                src="/assets/services/vision-mission.png"
                alt="Caregiver with patient"
              />
            </div>
          </div>
        </div>
      </section>
      <ContentSection title={m.goalsTitle}>
        {m.goals.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
      </ContentSection>
      <ContentSection title={m.objectivesTitle} className="bg-purple-50">
        <ul className="list-disc space-y-2 pl-5">
          {m.objectives.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </ContentSection>
      <ContentSection title={m.coreValuesTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {m.coreValues.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-6">{m.community}</p>
        <p>{m.respect}</p>
      </ContentSection>
    </>
  );
}
