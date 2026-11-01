import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { home } from "@/content/mockup";

export function FlyerHomeSections() {
  const f = home.flyer;

  return (
    <>
      <section className="relative overflow-hidden bg-sky py-14 sm:py-16">
        <p
          className="font-script pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 select-none text-[clamp(80px,18vw,160px)] leading-none text-purple-900/[0.04]"
          aria-hidden
        >
          Home Care
        </p>
        <div className="site-container relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="body-muted m-0 text-base leading-relaxed sm:text-lg">{f.intro}</p>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <Reveal delay={80}>
              <h2 className="font-display m-0 text-2xl text-purple-900 sm:text-3xl">Choose us for:</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {f.serviceChecks.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-purple-900 sm:text-base">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-900 text-white">
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={160} className="flex justify-center lg:justify-end">
              <ButtonLink href="/contact" variant="gold" className="btn-shimmer px-10 uppercase tracking-wider">
                Contact Us Now
              </ButtonLink>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {f.circles.map((item, i) => (
              <Reveal key={item.title} delay={i * 100} className="text-center">
                <div className="flyer-circle-card group mx-auto">
                  <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-[var(--gold)] shadow-lg sm:h-44 sm:w-44">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="176px"
                    />
                  </div>
                  <p className="font-display mt-4 text-lg text-purple-900">{item.title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="flyer-promo-band py-8 sm:py-10">
        <div className="site-container flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="m-0 max-w-2xl text-sm font-bold uppercase leading-relaxed tracking-wide text-white sm:text-base">
            {f.promo}
          </p>
          <ButtonLink href="/contact" variant="white" className="shrink-0 uppercase tracking-wide">
            Free Consultation →
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
