"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { site } from "@/content/site";

export function CinematicHero() {
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
    <section className="relative isolate overflow-hidden bg-cream">
      <div className="brand-ribbon absolute inset-x-0 top-0 h-1.5" aria-hidden />
      <div className="absolute inset-0">
        <Image
          src={site.images.hero}
          alt=""
          fill
          priority
          className={`object-cover transition-transform duration-[1800ms] ease-out ${entered ? "scale-100" : "scale-110"}`}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)] via-[rgb(6_29_69_/0.82)] to-[rgb(6_29_69_/0.35)]" />
        <div className="brand-curve" aria-hidden />
      </div>

      <div className="site-container relative z-[1] flex min-h-[min(88vh,760px)] flex-col justify-center py-16 sm:py-20">
        <div className={`hero-copy max-w-2xl ${entered ? "hero-copy-visible" : ""}`}>
          <p className="hero-copy-item font-display text-sm font-semibold uppercase tracking-[0.28em] text-[var(--gold-light)]">
            JoyTogether Home Care
          </p>
          <h1 className="hero-copy-item font-display mt-4 text-[clamp(42px,8vw,78px)] font-bold uppercase tracking-[0.04em] text-white">
            The Art of Caring.
          </h1>
          <p className="hero-copy-item mt-4 text-xl text-white/92 sm:text-2xl">
            Compassion That Feels Like Family. Care That Feels Like Home.
          </p>
          <p className="hero-copy-item mt-5 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
            From skilled nursing and hospice care to personalized private duty services,
            JoyTogether Home Care provides compassionate care designed around the needs of
            individuals and families.
          </p>
          <div className="hero-copy-item mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/contact" variant="gold" className="btn-shimmer uppercase tracking-wide">
              Request a Free Consultation
            </ButtonLink>
            <ButtonLink href="/services" variant="outlineLight" className="border-white/70">
              Explore Our Services
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
