import Image from "next/image";
import Link from "next/link";
import { Heart, Home, Sparkles, Users } from "lucide-react";
import { LiveHomeSections } from "@/components/home/LiveHomeSections";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { home } from "@/content/mockup";
import { site } from "@/content/site";

const featureIcons = [Heart, Home, Users, Sparkles];

export default function HomePage() {
  const h = home;

  return (
    <>
      <section className="relative min-h-[520px] overflow-hidden sm:min-h-[560px]">
        <Image
          src={site.images.hero}
          alt="Caregiver with client at home"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-l from-purple-900/88 via-purple-800/45 to-purple-900/15"
          aria-hidden
        />
        <div className="site-container relative z-[1] flex min-h-[520px] items-center py-12 sm:min-h-[560px] sm:py-16 md:justify-end md:py-20">
          <div className="w-full max-w-xl text-left md:max-w-[520px] md:text-right">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-100 sm:text-[11px] sm:tracking-[0.24em]">
              {h.hero.eyebrow}
            </p>
            <h1 className="font-display m-0 text-[clamp(32px,8vw,58px)] text-white">
              {h.hero.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-purple-50 sm:mt-5 sm:text-[17px] md:ml-auto md:max-w-[480px]">
              {h.hero.subtitle}
            </p>
            <div className="mt-6 flex w-full max-w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap md:justify-end">
              <ButtonLink
                href={h.hero.primaryCta.href}
                variant="white"
                className="w-full px-4 text-center text-[13px] shadow-lg shadow-purple-900/30 sm:w-auto sm:text-sm"
              >
                {h.hero.primaryCta.label}
              </ButtonLink>
              <ButtonLink
                href={h.hero.secondaryCta.href}
                variant="outlineLight"
                className="w-full sm:w-auto"
              >
                {h.hero.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>
        </div>
        <WaveDivider fill="#faf7fc" className="absolute bottom-0 left-0" />
      </section>

      <section className="bg-purple-50 pb-4 pt-2">
        <div className="site-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {h.features.map((item, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 grid h-[62px] w-[62px] place-items-center rounded-full bg-white text-purple-600 shadow-sm">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="m-0 text-[15px] font-bold text-purple-900">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
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
          </div>
          <div>
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
          </div>
        </div>
      </section>

      <section className="section-pad bg-purple-50">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow-purple">{h.servicesTeaser.eyebrow}</p>
            <h2 className="font-display m-0 text-[clamp(32px,4vw,44px)]">
              {h.servicesTeaser.title}
            </h2>
            <p className="body-muted mt-3">{h.servicesTeaser.intro}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {h.servicesTeaser.cards.map((card) => (
              <article key={card.id} className="card-soft overflow-hidden">
                <div className="relative h-44">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display m-0 text-xl text-purple-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted">{card.description}</p>
                  <Link
                    href={`/services#${card.id}`}
                    className="mt-4 inline-block text-sm font-bold text-purple-700 hover:text-purple-900"
                  >
                    Learn More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href={h.servicesTeaser.viewAll.href} variant="outlinePurple">
              {h.servicesTeaser.viewAll.label}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2">
          <div>
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
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-square overflow-hidden rounded-full border-8 border-white shadow-xl">
              <Image
                src={site.images.about}
                alt="Hands held in care"
                width={480}
                height={480}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="absolute -bottom-2 left-4 max-w-[220px] font-display text-2xl italic text-purple-700">
              &ldquo;{h.whyTeaser.quote}&rdquo;
            </p>
          </div>
        </div>
      </section>

      <LiveHomeSections />

      <section className="relative overflow-hidden py-24">
        <Image
          src={site.images.hero}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-purple-900/72" />
        <div className="site-container relative z-[1] text-center text-white">
          <h2 className="font-display m-0 text-[clamp(32px,4vw,44px)]">{h.cta.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-purple-100">{h.cta.subtitle}</p>
          <div className="mt-8">
            <ButtonLink href={h.cta.button.href} variant="white">
              {h.cta.button.label}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
