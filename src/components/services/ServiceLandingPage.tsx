import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { ServiceLanding } from "@/content/careServices";
import { site } from "@/content/site";

export function ServiceLandingPage({ service }: { service: ServiceLanding }) {
  return (
    <>
      <PageHero
        eyebrow={service.eyebrow}
        title={service.headline}
        description={service.intro}
        cta={{ label: "Request a Free Consultation →", href: "/contact" }}
      />

      <section className="section-pad bg-white">
        <div className="site-container grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border-4 border-[var(--joy-green)]/40 shadow-xl">
              <Image
                src={service.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
                priority
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display m-0 text-3xl text-purple-900">Who this may help</h2>
            <ul className="mt-5 space-y-3">
              {service.whoFor.map((item) => (
                <li key={item} className="flex gap-2 text-sm font-medium text-purple-900">
                  <span className="text-[var(--joy-green-dark)]" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" variant="gold" className="uppercase tracking-wide">
                Request a Consultation
              </ButtonLink>
              <a href={site.contact.phoneHref} className="btn btn-outline-purple">
                Call {site.contact.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-sky">
        <div className="site-container">
          <Reveal>
            <h2 className="font-display m-0 text-center text-3xl text-purple-900">
              What this service may include
            </h2>
            <p className="body-muted mx-auto mt-3 max-w-2xl text-center text-sm">
              Availability depends on assessment, licensing scope, staffing, and individual
              circumstances.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {service.mayInclude.map((item, i) => (
              <Reveal key={item} delay={i * 40}>
                <li className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-purple-900 shadow-sm">
                  {item}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-container grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display m-0 text-3xl text-purple-900">How to begin</h2>
            <ol className="mt-6 space-y-4">
              {service.howToBegin.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="font-display text-2xl text-[var(--royal)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="body-muted m-0 pt-1 text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display m-0 text-3xl text-purple-900">FAQ</h2>
            <div className="mt-6 space-y-4">
              {service.faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="rounded-2xl border border-line bg-cream px-5 py-4 open:bg-white open:shadow-sm"
                >
                  <summary className="cursor-pointer font-bold text-purple-900">{faq.q}</summary>
                  <p className="body-muted mt-3 text-sm leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {service.disclaimer ? (
        <section className="pb-10">
          <div className="site-container">
            <p className="rounded-2xl border border-line bg-purple-50 px-5 py-4 text-sm text-muted">
              {service.disclaimer}
            </p>
          </div>
        </section>
      ) : null}

      <section className="section-pad bg-[var(--midnight)] text-center text-white">
        <div className="site-container">
          <h2 className="font-display m-0 text-3xl">Ready to talk through options?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Contact JoyTogether Home Care at{" "}
            <a className="font-bold text-[var(--gold-light)] hover:underline" href={site.contact.phoneHref}>
              {site.contact.phone}
            </a>{" "}
            or{" "}
            <a className="font-bold text-[var(--gold-light)] hover:underline" href={site.contact.emailHref}>
              {site.contact.email}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" variant="gold" className="uppercase tracking-wide">
              Request a Consultation
            </ButtonLink>
            <Link href="/services" className="text-sm font-bold text-white/85 hover:text-white">
              ← All services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
