import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { home } from "@/content/mockup";
import { aboutContent } from "@/content/site";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Why Choose Us",
  description:
    "Discover why Tampa Bay families trust Joy Together Home Care for compassionate, personalized in-home support.",
};

export default function WhyChooseUsPage() {
  const items = home.whyTeaser.items;

  return (
    <>
      <PageHero
        eyebrow="Why Choose Us"
        title="A Higher Standard of Home Care"
        description={aboutContent.whyChoose.intro}
        cta={{ label: "Request a Free Consultation →", href: "/contact" }}
      />

      <section className="section-pad">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2">
          <ul className="space-y-6">
            {items.map((item) => (
              <li key={item.title} className="card-soft p-6">
                <strong className="text-lg text-purple-900">{item.title}</strong>
                <p className="body-muted m-0 mt-2 text-sm">{item.description}</p>
              </li>
            ))}
          </ul>
          <div className="relative mx-auto max-w-md">
            <div className="aspect-square overflow-hidden rounded-full border-8 border-purple-50 shadow-xl">
              <Image
                src={site.images.about}
                alt="Compassionate care"
                width={480}
                height={480}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-6 text-center font-display text-2xl italic text-purple-700">
              &ldquo;{home.whyTeaser.quote}&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad bg-purple-50">
        <div className="site-container">
          <h2 className="font-display m-0 mb-6 text-3xl">{aboutContent.whyChoose.title}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {aboutContent.whyChoose.bullets.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-purple-900"
              >
                <span className="text-sage">✓</span> {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <ButtonLink href="/contact" variant="sage">Talk With Our Team →</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
