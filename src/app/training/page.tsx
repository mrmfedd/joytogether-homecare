import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { trainingContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Courses & Trainings",
  description: trainingContent.intro,
};

export default function TrainingPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title={trainingContent.title}
        description={trainingContent.intro}
        cta={{ label: "Register for a Class →", href: "/contact" }}
      />

      <section className="section-pad">
        <div className="site-container space-y-6">
          {trainingContent.courses.map((course) => (
            <article key={course.title} className="card-soft p-8">
              <h2 className="font-display m-0 text-2xl">{course.title}</h2>
              <p className="body-muted mt-3">{course.body}</p>
            </article>
          ))}
          <ButtonLink href="/resources" variant="outlinePurple">← Back to Resources</ButtonLink>
        </div>
      </section>
    </>
  );
}
