import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { majorCareExperiences } from "@/content/careServices";

const accentBar = {
  navy: "from-[var(--midnight)] to-[var(--royal)]",
  sky: "from-[var(--royal)] to-[var(--sky-brand)]",
  green: "from-[var(--joy-green-dark)] to-[var(--joy-green)]",
} as const;

export function MajorCarePanels() {
  return (
    <section className="section-pad bg-white" id="major-care">
      <div className="site-container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow-purple">Three Care Experiences</p>
          <h2 className="font-display m-0 text-[clamp(30px,4vw,46px)] text-purple-900">
            Clinical Care. Comfort. Private Options.
          </h2>
          <p className="body-muted mt-4">
            Explore JoyTogether&apos;s primary care pathways — each designed for different needs,
            with clear next steps and a consultation when you are ready.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {majorCareExperiences.map((item, i) => (
            <Reveal key={item.id} delay={i * 100}>
              <article
                className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-cream shadow-lg transition-transform duration-300 hover:-translate-y-1 ${
                  "featured" in item && item.featured
                    ? "ring-2 ring-[var(--joy-green)] lg:scale-[1.02]"
                    : ""
                }`}
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="400px"
                  />
                  <div className={`absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r ${accentBar[item.accent]}`} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--royal)]">
                    {item.eyebrow}
                  </p>
                  <h3 className="font-display m-0 mt-2 text-2xl text-purple-900">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-purple-800">{item.tagline}</p>
                  <p className="body-muted mt-3 flex-1 text-sm leading-relaxed">{item.summary}</p>
                  <div className="mt-6 flex flex-col gap-2">
                    <ButtonLink
                      href={item.href}
                      variant={"featured" in item && item.featured ? "gold" : "purple"}
                      className="w-full"
                    >
                      Learn About {item.title}
                    </ButtonLink>
                    <Link
                      href="/contact"
                      className="text-center text-sm font-bold text-purple-700 hover:underline"
                    >
                      Request a Consultation →
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
