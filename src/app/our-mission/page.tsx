import type { Metadata } from "next";
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
      <ContentSection title="Our vision">
        <p>{m.vision}</p>
      </ContentSection>
      <ContentSection title="Our mission" className="bg-purple-50">
        <p>{m.mission}</p>
        {m.missionParagraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
      </ContentSection>
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
