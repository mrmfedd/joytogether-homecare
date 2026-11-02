import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function PrivateDutyFeature() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24" id="private-duty">
      <div className="brand-ribbon absolute inset-0" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255_/0.14),transparent_40%)]" aria-hidden />
      <div className="site-container relative z-[1] text-white">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-white/80">
            Private Duty Care
          </p>
          <h2 className="font-display m-0 mt-4 text-[clamp(34px,6vw,64px)] uppercase tracking-wide">
            No Insurance? You Still Have Options.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/88 sm:text-lg">
            JoyTogether Home Care offers private-pay care options for individuals and families
            seeking compassionate, personalized support without relying on insurance coverage.
          </p>
          <ul className="mt-8 grid gap-3 text-sm font-semibold text-white/92 sm:grid-cols-2">
            <li>• Personalized care discussions</li>
            <li>• Nonmedical support options</li>
            <li>• Scheduling based on availability</li>
            <li>• Clear next steps with our care team</li>
          </ul>
          <p className="mt-6 max-w-2xl text-sm text-white/75">
            Private-pay care is distinct from insurance-covered skilled nursing or hospice
            eligibility. Pricing, staffing, and availability depend on the selected services and
            individual circumstances.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/services/private-duty-care" variant="white" className="uppercase tracking-wide">
              Explore Private Duty Care
            </ButtonLink>
            <ButtonLink href="/contact" variant="outlineLight" className="border-white/80">
              Speak With Our Care Team
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
