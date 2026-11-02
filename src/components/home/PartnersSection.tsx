import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { partners } from "@/content/servicesCatalog";

export function PartnersSection() {
  return (
    <section className="section-pad bg-white" aria-labelledby="our-homes-heading">
      <div className="site-container">
        <Reveal>
          <h2
            id="our-homes-heading"
            className="font-display m-0 text-center text-2xl uppercase tracking-[0.12em] text-teal sm:text-3xl"
          >
            Our Homes
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-10 sm:grid-cols-3 sm:gap-6">
          {partners.map((partner, i) => {
            const external = partner.href.startsWith("http");
            return (
              <Reveal key={partner.id} delay={i * 90} className="text-center">
                <Link
                  href={partner.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group mx-auto flex max-w-[240px] flex-col items-center gap-4 rounded-2xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                  aria-label={partner.name}
                >
                  {"logo" in partner ? (
                    <div className="flex h-36 w-full items-center justify-center px-2 sm:h-40">
                      <Image
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        width={partner.logoWidth}
                        height={partner.logoHeight}
                        className="max-h-full w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-[var(--gold)] shadow-lg sm:h-40 sm:w-40">
                      <Image
                        src={partner.image}
                        alt={partner.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="160px"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-display m-0 text-lg text-purple-900">{partner.name}</p>
                    <p className="body-muted mt-1 text-sm leading-snug">{partner.description}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
