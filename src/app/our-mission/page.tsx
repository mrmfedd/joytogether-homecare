import type { Metadata } from "next";
import Image from "next/image";
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
        <div className="site-container grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display m-0 mb-4 text-2xl uppercase text-purple-900">Our vision</h2>
            <p className="body-muted">{m.vision}</p>
            <h2 className="font-display mt-8 mb-4 text-2xl uppercase text-purple-900">Our mission</h2>
            <p className="body-muted">{m.mission}</p>
            {m.missionParagraphs.map((p) => (
              <p key={p.slice(0, 40)} className="body-muted mt-4">{p}</p>
            ))}
          </div>
          <Image
            src="/assets/services/vision-mission.png"
            alt="Caregiver with patient"
            width={500}
            height={600}
            className="w-full rounded-xl object-cover shadow-md"
          />
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
