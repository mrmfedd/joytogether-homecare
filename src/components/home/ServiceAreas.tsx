import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { site } from "@/content/site";

const areas = [
  "Tampa",
  "Apollo Beach",
  "Brandon",
  "Palmetto",
  "Hillsborough County",
  "Manatee County",
  "Greater Tampa Bay",
];

export function ServiceAreas() {
  return (
    <section className="section-pad bg-sky">
      <div className="site-container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <p className="eyebrow-purple">Service Areas</p>
          <h2 className="font-display m-0 text-[clamp(30px,4vw,46px)] text-purple-900">
            Serving Families Across the Greater Tampa Bay Area
          </h2>
          <p className="body-muted mt-4 max-w-xl">
            JoyTogether Home Care is based in Apollo Beach and supports families throughout confirmed
            local communities. Coverage for a specific address is confirmed during consultation.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {areas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-purple-900"
              >
                {area}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ButtonLink href="/palmetto-fl" variant="outlinePurple">
              View Palmetto, FL Info →
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-[2rem] border border-line bg-white p-8 shadow-sm">
            <p className="font-display text-2xl text-purple-900">Office</p>
            <p className="body-muted mt-3 text-sm leading-relaxed">
              {site.contact.address.line1}
              <br />
              {site.contact.address.city}, {site.contact.address.state} {site.contact.address.zip}
            </p>
            <p className="mt-5 text-sm font-semibold text-purple-900">
              <a href={site.contact.phoneHref} className="hover:text-[var(--royal)]">
                {site.contact.phone}
              </a>
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-purple-900">
              <a href={site.contact.emailHref} className="hover:text-[var(--royal)]">
                {site.contact.email}
              </a>
            </p>
            <div className="mt-6">
              <ButtonLink href="/contact" variant="gold" className="w-full uppercase tracking-wide">
                Confirm Your Location
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
