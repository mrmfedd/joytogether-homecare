"use client";

import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function AnimatedPageHero({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="page-hero relative overflow-hidden">
      <div className="page-hero-glow pointer-events-none" aria-hidden />
      <div className="site-container relative max-w-3xl">
        <Reveal>
          {eyebrow ? <p className="eyebrow-purple">{eyebrow}</p> : null}
          <h1 className="font-display">{title}</h1>
          {description ? <p className="body-muted m-0">{description}</p> : null}
          {cta ? (
            <div className="mt-8">
              <ButtonLink href={cta.href} variant="purple" className="btn-shimmer">
                {cta.label}
              </ButtonLink>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
