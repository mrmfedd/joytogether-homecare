import type { Metadata } from "next";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { PageHero } from "@/components/layout/PageHero";
import { liveApply } from "@/content/liveSite";

export const metadata: Metadata = {
  title: "Apply",
  description: liveApply.intro,
};

export default function ApplyPage() {
  return (
    <>
      <PageHero title={liveApply.title} description={liveApply.intro} />
      <section className="section-pad bg-purple-50">
        <ApplyForm />
      </section>
    </>
  );
}
