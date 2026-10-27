import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { fingerprintingContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Fingerprinting",
  description: fingerprintingContent.paragraphs.join(" "),
};

export default function FingerprintingPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title={fingerprintingContent.title}
        description={fingerprintingContent.subtitle}
        cta={{ label: "Book Fingerprinting →", href: "/contact" }}
      />

      <section className="section-pad">
        <div className="site-container grid gap-8 lg:grid-cols-2">
          <div className="body-muted space-y-4">
            {fingerprintingContent.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="rounded-3xl bg-purple-800 p-10 text-white">
            <p className="eyebrow-purple !text-purple-200">Live Scan</p>
            <h2 className="font-display m-0 text-3xl">Simple. Fast. Accessible.</h2>
            <p className="mt-4 text-purple-100">
              Electronic submissions help professionals meet state and federal screening
              requirements without unnecessary delays.
            </p>
            <div className="mt-8">
              <ButtonLink href="/contact" variant="white">Schedule Now →</ButtonLink>
            </div>
          </aside>
        </div>
        <div className="site-container mt-8">
          <ButtonLink href="/resources" variant="outlinePurple">← Back to Resources</ButtonLink>
        </div>
      </section>
    </>
  );
}
