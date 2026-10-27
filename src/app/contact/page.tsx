import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact Joy Together Home Care — ${site.contact.phone}.`,
};

export default function ContactPage() {
  const { address, phone, phoneHref, email, emailHref, serviceArea } = site.contact;
  const mapsQuery = encodeURIComponent(
    `${address.line1}, ${address.city}, ${address.state} ${address.zip}`,
  );

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Talk About Your Care Needs"
        description="Looking for compassionate care for yourself or someone you love? Reach out for a friendly, no-pressure consultation."
      />

      <section className="section-pad">
        <div className="site-container grid gap-12 lg:grid-cols-2">
          <div>
            <div className="card-soft space-y-5 p-8">
              <ContactRow icon={Phone} label="Phone">
                <a href={phoneHref} className="font-bold text-purple-800 hover:text-purple-600">
                  {phone}
                </a>
                <span className="block text-sm text-muted">24/7 including weekends & holidays</span>
              </ContactRow>
              <ContactRow icon={Mail} label="Email">
                <a href={emailHref} className="break-all font-bold text-purple-800">
                  {email}
                </a>
              </ContactRow>
              <ContactRow icon={MapPin} label="Office">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-800 hover:text-purple-600"
                >
                  {address.line1}
                  <br />
                  {address.city}, {address.state} {address.zip}
                </a>
                <span className="block text-sm text-muted">Serving {serviceArea}</span>
              </ContactRow>
            </div>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-1 h-5 w-5 shrink-0 text-sage" aria-hidden />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-purple-600">{label}</p>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  );
}
