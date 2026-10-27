import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { aboutContent } from "@/content/site";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how Joy Together Home Care supports families across Tampa Bay with compassionate, family-centered home care.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Care That Feels Like Family"
        description={aboutContent.intro[0]}
        cta={{ label: "Request a Free Consultation →", href: "/contact" }}
      />

      <section className="section-pad">
        <div className="site-container grid items-start gap-12 lg:grid-cols-2">
          <Image
            src={site.images.about}
            alt="Joy Together caregiver with client"
            width={560}
            height={420}
            className="w-full rounded-[22px] object-cover"
          />
          <div className="space-y-4 body-muted">
            {aboutContent.intro.slice(1).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-purple-50">
        <div className="site-container grid gap-6 md:grid-cols-2">
          <article className="card-soft p-8">
            <h2 className="font-display m-0 text-2xl">{aboutContent.partOfFamily.title}</h2>
            <p className="body-muted mt-3">{aboutContent.partOfFamily.body}</p>
          </article>
          {aboutContent.highlights.map((item) => (
            <article key={item.title} className="card-soft p-8">
              <h3 className="font-display m-0 text-xl">{item.title}</h3>
              <p className="body-muted mt-3 text-sm">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad text-center">
        <div className="site-container">
          <ButtonLink href="/contact" variant="purple">Get to Know Us →</ButtonLink>
        </div>
      </section>
    </>
  );
}
