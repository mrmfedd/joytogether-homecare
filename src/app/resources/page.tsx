import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { fingerprintingContent, trainingContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "CPR and first-aid training, fingerprinting services, and helpful resources from Joy Together Home Care.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Helpful Services & Community Resources"
        description="Beyond daily home care, Joy Together offers professional training, certification, and Live Scan fingerprinting for individuals and organizations."
      />

      <section className="section-pad">
        <div className="site-container grid gap-8 lg:grid-cols-2">
          <article className="card-soft flex flex-col p-8">
            <p className="eyebrow-purple">Training</p>
            <h2 className="font-display m-0 text-2xl">{trainingContent.title}</h2>
            <p className="body-muted mt-3 flex-1 text-sm">{trainingContent.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/training" variant="purple">View Courses →</ButtonLink>
              <ButtonLink href="/contact" variant="outlinePurple">Register</ButtonLink>
            </div>
          </article>

          <article className="card-soft flex flex-col p-8">
            <p className="eyebrow-purple">Fingerprinting</p>
            <h2 className="font-display m-0 text-2xl">{fingerprintingContent.title}</h2>
            <p className="body-muted mt-3 flex-1 text-sm">
              {fingerprintingContent.paragraphs.join(" ")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/fingerprinting" variant="purple">Learn More →</ButtonLink>
              <ButtonLink href="/contact" variant="outlinePurple">Book Appointment</ButtonLink>
            </div>
          </article>
        </div>
      </section>

      <section className="section-pad bg-purple-50">
        <div className="site-container">
          <h2 className="font-display m-0 mb-6 text-2xl">Quick links</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/services", label: "Home care services" },
              { href: "/about", label: "About our team" },
              { href: "/why-choose-us", label: "Why families choose us" },
              { href: "/contact", label: "Free consultation" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="card-soft block px-5 py-4 font-bold text-purple-800 hover:text-purple-600"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
