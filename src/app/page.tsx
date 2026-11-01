import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { FlyerHomeSections } from "@/components/home/FlyerHomeSections";
import { LiveHomeSections } from "@/components/home/LiveHomeSections";
import { TampaReviewsSection } from "@/components/home/TampaReviewsSection";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { home } from "@/content/mockup";
import { site } from "@/content/site";

export default function HomePage() {
  const h = home;

  return (
    <>
      <HomeHero />
      <FlyerHomeSections />

      <section className="section-pad bg-cream">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="overflow-hidden rounded-[28px] border-4 border-[var(--gold)] shadow-xl">
              <Image
                src={site.images.about}
                alt="Caregiver and client smiling"
                width={560}
                height={420}
                className="w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="font-script text-[clamp(36px,6vw,52px)] text-[var(--gold-dark)]">
              {h.aboutTeaser.scribble.split(" ").slice(0, 2).join(" ")}
            </p>
            <p className="eyebrow-purple">{h.aboutTeaser.eyebrow}</p>
            <h2 className="font-display m-0 text-[clamp(32px,4vw,44px)] text-purple-900">
              {h.aboutTeaser.title}
            </h2>
            <p className="body-muted mt-4">{h.aboutTeaser.body}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {h.aboutTeaser.bullets.map((b) => (
                <li key={b} className="text-sm font-semibold text-purple-800">
                  <span className="text-[var(--gold-dark)]">✓</span> {b}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink href={h.aboutTeaser.cta.href} variant="gold">
                {h.aboutTeaser.cta.label}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <TampaReviewsSection />

      <LiveHomeSections />

      <section className="relative overflow-hidden py-24">
        <div className="hero-ken-burns absolute inset-0">
          <Image
            src={site.images.hero}
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-purple-900/88" />
        <Reveal className="site-container relative z-[1] text-center text-white">
          <p className="font-script m-0 text-4xl text-[var(--gold-light)] sm:text-5xl">Together</p>
          <h2 className="font-display m-0 mt-2 text-[clamp(32px,4vw,44px)] uppercase tracking-wide">
            {h.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-purple-100">{h.cta.subtitle}</p>
          <div className="mt-8">
            <ButtonLink href={h.cta.button.href} variant="gold" className="btn-shimmer uppercase tracking-wide">
              {h.cta.button.label}
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
