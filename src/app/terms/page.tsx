import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Service" />
      <section className="section-pad">
        <div className="site-container body-muted max-w-3xl space-y-4">
          <p>
            Use of this website is provided by {site.legalName} for general information
            about home care and related services in the {site.contact.serviceArea}.
          </p>
          <p>
            Service availability, pricing, and care plans are confirmed directly with our
            team. Nothing on this site constitutes medical advice.
          </p>
          <p>
            Questions? Call{" "}
            <a href={site.contact.phoneHref} className="font-bold text-purple-700">
              {site.contact.phone}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
