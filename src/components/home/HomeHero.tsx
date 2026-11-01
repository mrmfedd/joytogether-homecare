"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { home } from "@/content/mockup";
import { site } from "@/content/site";

export function HomeHero() {
  const f = home.flyer;
  const h = home.hero;
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setEntered(true);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="flyer-hero relative z-0 overflow-hidden">
      <Image
        src={site.images.hero}
        alt=""
        fill
        priority
        className="object-cover object-center opacity-[0.22]"
        sizes="100vw"
        aria-hidden
      />
      <div className="site-container relative z-[1] py-10 sm:py-14 lg:py-16">
        <div
          className={`flyer-hero-grid grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-6 ${entered ? "hero-copy-visible" : ""}`}
        >
          <div className="flyer-navy-panel hero-copy relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-10 sm:py-12 lg:max-w-xl lg:rounded-r-[120px] lg:px-10 lg:py-14">
            <p className="hero-copy-item font-script m-0 text-[clamp(42px,10vw,72px)] leading-none text-[var(--gold-light)]">
              {f.scriptTitle}
            </p>
            <h1 className="hero-copy-item font-display m-0 mt-1 text-[clamp(28px,5vw,42px)] font-bold uppercase tracking-[0.06em] text-white">
              {f.headline}
            </h1>
            <p className="hero-copy-item mt-4 text-base text-white/90 sm:text-lg">{f.tagline}</p>
            <p className="hero-copy-item mt-3 text-sm leading-relaxed text-white/75">{h.subtitle}</p>
            <div className="hero-copy-item mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={h.primaryCta.href} variant="gold" className="btn-shimmer uppercase tracking-wide">
                Contact Us Now
              </ButtonLink>
              <ButtonLink href={h.secondaryCta.href} variant="outlineLight" className="border-white/70">
                {h.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          <div className="hero-copy-item relative mx-auto flex justify-center lg:mx-0 lg:-ml-16">
            <span
              className="flyer-teal-blob absolute -right-4 top-1/2 h-[88%] w-[88%] -translate-y-1/2 rounded-[40%] bg-teal/90"
              aria-hidden
            />
            <div className="flyer-portrait-ring relative z-[1] h-[240px] w-[240px] overflow-hidden rounded-full border-[5px] border-[var(--gold)] shadow-2xl sm:h-[280px] sm:w-[280px] lg:h-[320px] lg:w-[320px]">
              <Image
                src={site.images.about}
                alt="Caregiver with client at home"
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      <WaveDivider fill="var(--sky)" className="relative z-[1]" />
    </section>
  );
}
