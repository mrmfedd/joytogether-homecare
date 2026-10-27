import type { Metadata } from "next";
import { LiveHomeSections } from "@/components/home/LiveHomeSections";
import { PageHero } from "@/components/layout/PageHero";
import { ContentSection } from "@/components/layout/ContentSection";
import { liveOurWork } from "@/content/liveSite";

export const metadata: Metadata = {
  title: "Home Care and Companion Care",
  description:
    "Exceptional, affordable home care and companion services from JoyTogether Home Care LLC in Tampa Bay.",
};

export default function HomeCareCompanionPage() {
  return (
    <>
      <PageHero
        eyebrow="Home Care & Companion Care"
        title="Trusted In-Home Care in Tampa, FL"
        description="Professional appointment-based caregivers and dependable companion attention when you need it."
      />
      <LiveHomeSections />
      <ContentSection title="Our work" className="bg-purple-50">
        <div className="grid gap-6 md:grid-cols-2">
          {liveOurWork.map((item) => (
            <article key={item.title} className="card-soft p-6">
              <h3 className="font-display m-0 text-lg text-purple-900">{item.title}</h3>
              <p className="mt-2 text-sm">{item.body}</p>
            </article>
          ))}
        </div>
      </ContentSection>
    </>
  );
}
