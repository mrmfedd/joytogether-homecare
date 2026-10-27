import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { livePalmetto } from "@/content/liveSite";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Home Health Care for Palmetto, FL",
  description: livePalmetto.intro,
};

export default function PalmettoPage() {
  const p = livePalmetto;

  return (
    <>
      <PageHero title={p.title} description={p.intro} />
      <section className="section-pad">
        <div className="site-container max-w-4xl body-muted space-y-4">
          {p.sections[0].paragraphs.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          <p className="font-bold text-purple-900">
            Call us at{" "}
            <a href={site.contact.phoneHref} className="text-purple-700 hover:underline">
              {site.contact.phone}
            </a>{" "}
            to learn more about our services.
          </p>
          <ButtonLink href="/contact" variant="purple">Request a Consultation →</ButtonLink>
        </div>
      </section>
    </>
  );
}
