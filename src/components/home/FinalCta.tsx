import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { site } from "@/content/site";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--midnight),var(--royal)_55%,#0a6b4f)]" />
      <div className="site-container relative z-[1] text-center text-white">
        <Reveal>
          <h2 className="font-display m-0 text-[clamp(32px,5vw,52px)] uppercase tracking-wide">
            Your Family Deserves Compassionate Care.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/85 sm:text-lg">
            Whether you&apos;re looking for skilled nursing, hospice support, or private duty care,
            JoyTogether Home Care is here to help you explore your options.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" variant="white" className="uppercase tracking-wide">
              Request a Consultation
            </ButtonLink>
            <a href={site.contact.phoneHref} className="btn btn-outline-light border-white/80">
              Call {site.contact.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
