"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { home } from "@/content/mockup";
import { site } from "@/content/site";

function HeroOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <span className="orb orb-a absolute -left-8 top-[18%] h-32 w-32 rounded-full bg-sage/25 blur-2xl" />
      <span className="orb orb-b absolute right-[12%] top-[22%] h-44 w-44 rounded-full bg-purple-300/20 blur-3xl" />
      <span className="orb orb-c absolute bottom-[28%] right-[8%] h-24 w-24 rounded-full bg-white/15 blur-xl" />
    </div>
  );
}

export function HomeHero() {
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
    <section className="relative z-0 min-h-[520px] overflow-hidden sm:min-h-[560px]">
      <div className="hero-ken-burns absolute inset-0">
        <Image
          src={site.images.hero}
          alt="Caregiver with client at home"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-l from-purple-900/88 via-purple-800/45 to-purple-900/15"
        aria-hidden
      />
      <HeroOrbs />
      <div className="site-container relative z-[1] flex min-h-[520px] items-center py-12 sm:min-h-[560px] sm:py-16 md:justify-end md:py-20">
        <div
          className={`hero-copy w-full max-w-xl text-left md:max-w-[520px] md:text-right ${entered ? "hero-copy-visible" : ""}`}
        >
          <p className="hero-copy-item mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-100 sm:text-[11px] sm:tracking-[0.24em]">
            {h.eyebrow}
          </p>
          <h1 className="font-display hero-copy-item m-0 text-[clamp(32px,8vw,58px)] text-white">
            {h.title}
          </h1>
          <p className="hero-copy-item mt-4 text-base leading-relaxed text-purple-50 sm:mt-5 sm:text-[17px] md:ml-auto md:max-w-[480px]">
            {h.subtitle}
          </p>
          <div className="hero-copy-item mt-6 flex w-full max-w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap md:justify-end">
            <ButtonLink
              href={h.primaryCta.href}
              variant="white"
              className="btn-shimmer w-full px-4 text-center text-[13px] shadow-lg shadow-purple-900/30 sm:w-auto sm:text-sm"
            >
              {h.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={h.secondaryCta.href} variant="outlineLight" className="w-full sm:w-auto">
              {h.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </div>
      <WaveDivider fill="#faf7fc" className="absolute bottom-0 left-0" />
    </section>
  );
}
