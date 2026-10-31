import Image from "next/image";
import Link from "next/link";
import { Heart, Home, Sparkles, Users } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { LiveHomeSections } from "@/components/home/LiveHomeSections";
import { TampaReviewsSection } from "@/components/home/TampaReviewsSection";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { home } from "@/content/mockup";
import { site } from "@/content/site";

const featureIcons = [Heart, Home, Users, Sparkles];

export default function HomePage() {
  const h = home;

  return (
    <>
      <HomeHero />

      <section className="bg-purple-50 pb-4 pt-2">
        <div className="site-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {h.features.map((item, i) => {
            const Icon = featureIcons[i];
            return (
              <Reveal key={item.title} delay={i * 90} className="text-center">
                <div
                  className={`feature-icon-ring mx-auto mb-4 grid h-[62px] w-[62px] place-items-center rounded-full bg-white text-purple-600 shadow-sm`}
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="m-0 text-[15px] font-bold text-purple-900">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <Image
              src={site.images.about}
              alt="Caregiver and client smiling"
              width={560}
              height={420}
              className="w-full rounded-[22px] object-cover shadow-lg"
            />
            <p
              className="absolute -bottom-4 -right-2 max-w-[180px] rotate-[-6deg] font-display text-lg text-purple-600/90"
              aria-hidden
            >
              {h.aboutTeaser.scribble} ♥
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow-purple">{h.aboutTeaser.eyebrow}</p>
            <h2 className="font-display m-0 text-[clamp(32px,4vw,44px)] text-purple-900">
              {h.aboutTeaser.title}
            </h2>
            <p className="body-muted mt-4">{h.aboutTeaser.body}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {h.aboutTeaser.bullets.map((b) => (
                <li key={b} className="text-sm font-semibold text-purple-800">
                  <span className="text-sage">✓</span> {b}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink href={h.aboutTeaser.cta.href} variant="sage">
                {h.aboutTeaser.cta.label}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-purple-50">
        <div className="site-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow-purple">{h.servicesTeaser.eyebrow}</p>
            <h2 className="font-display m-0 text-[clamp(32px,4vw,44px)]">
              {h.servicesTeaser.title}
            </h2>
            <p className="body-muted mt-3">{h.servicesTeaser.intro}</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {h.servicesTeaser.cards.map((card, i) => (
              <Reveal key={card.id} delay={i * 80}>
                <article className="card-soft card-interactive group overflow-hidden">
                  <div className="card-image-wrap relative h-44 overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 280px"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display m-0 text-xl text-purple-900">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted">{card.description}</p>
                    <Link
                      href={`/services#${card.id}`}
                      className="link-arrow mt-4 inline-block text-sm font-bold text-purple-700 hover:text-purple-900"
                    >
                      Learn More →
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center" delay={200}>
            <ButtonLink href={h.servicesTeaser.viewAll.href} variant="outlinePurple">
              {h.servicesTeaser.viewAll.label}
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow-purple">{h.whyTeaser.eyebrow}</p>
            <h2 className="font-display m-0 text-[clamp(32px,4vw,44px)]">{h.whyTeaser.title}</h2>
            <ul className="mt-8 space-y-5">
              {h.whyTeaser.items.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-100 text-sm text-purple-700">
                    ✓
                  </span>
                  <div>
                    <strong className="text-purple-900">{item.title}</strong>
                    <p className="m-0 mt-1 text-sm text-muted">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href={h.whyTeaser.cta.href} variant="purple">
                {h.whyTeaser.cta.label}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative mx-auto w-full max-w-md">
            <div className="portrait-ring aspect-square overflow-hidden rounded-full border-8 border-white shadow-xl">
              <Image
                src={site.images.about}
                alt="Hands held in care"
                width={480}
                height={480}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="quote-float absolute -bottom-2 left-4 max-w-[220px] font-display text-2xl italic text-purple-700">
              &ldquo;{h.whyTeaser.quote}&rdquo;
            </p>
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
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-purple-900/72" />
        <Reveal className="site-container relative z-[1] text-center text-white">
          <h2 className="font-display m-0 text-[clamp(32px,4vw,44px)]">{h.cta.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-purple-100">{h.cta.subtitle}</p>
          <div className="mt-8">
            <ButtonLink href={h.cta.button.href} variant="white" className="btn-shimmer">
              {h.cta.button.label}
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
