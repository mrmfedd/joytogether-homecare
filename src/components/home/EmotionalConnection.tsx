import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/content/site";

export function EmotionalConnection() {
  return (
    <section className="relative overflow-hidden bg-cream section-pad">
      <div className="site-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl sm:aspect-[5/4]">
            <Image
              src={site.images.about}
              alt="Caregiver supporting an older adult at home"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
          <div
            className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[var(--joy-green)]/20 blur-2xl"
            aria-hidden
          />
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow-purple">For Families Who Give Everything</p>
          <h2 className="font-display m-0 text-[clamp(32px,4.5vw,52px)] text-purple-900">
            They Took Care of You.{" "}
            <span className="text-[var(--royal)]">Now It&apos;s Their Turn.</span>
          </h2>
          <p className="body-muted mt-5 text-base leading-relaxed sm:text-lg">
            When aging parents, spouses, or loved ones need support, families deserve a care partner
            who listens first. JoyTogether Home Care helps households navigate skilled nursing,
            hospice support, and private duty options with dignity, clarity, and compassion.
          </p>
          <p className="body-muted mt-4 text-base leading-relaxed sm:text-lg">
            Whether the need is clinical, comfort-focused, or private-pay daily assistance, we work
            with you to explore appropriate next steps — never one-size-fits-all promises.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
