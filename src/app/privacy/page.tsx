import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" />
      <section className="section-pad">
        <div className="site-container body-muted max-w-3xl space-y-4">
          <p>
            {site.legalName} respects your privacy. Information submitted through our
            contact form or email is used only to respond to your inquiry and coordinate
            care or services.
          </p>
          <p>
            We do not sell personal information. For questions about this policy, contact{" "}
            <a href={site.contact.emailHref} className="font-bold text-purple-700">
              {site.contact.email}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
