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
          <article className="card-soft border-2 border-[var(--royal)]/25 p-8">
            <h2 className="font-display m-0 text-2xl">Staff portal training manual (PDF)</h2>
            <p className="body-muted mt-3">
              Printable guide for Administrator and Employee portal training—security, daily workflows, and checklists.
            </p>
            <a
              href="/downloads/joytogether-staff-portal-training-manual.pdf"
              download
              className="btn btn-purple mt-4 inline-flex"
            >
              Download PDF manual
            </a>
          </article>
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
