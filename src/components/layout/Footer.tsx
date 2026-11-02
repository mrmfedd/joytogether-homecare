import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { footer } from "@/content/mockup";
import { footerNavLinks } from "@/content/navigation";
import { site } from "@/content/site";

export function Footer() {
  const { address, phone, phoneHref, email, emailHref } = site.contact;
  const fullAddress = `${address.line1}, ${address.city}, ${address.state} ${address.zip}`;

  return (
    <footer className="mt-auto bg-sky">
      <div className="site-container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <ContactChip icon={Phone} label="Phone" href={phoneHref}>
            {phone}
          </ContactChip>
          <ContactChip icon={Mail} label="Email" href={emailHref}>
            {email}
          </ContactChip>
          <ContactChip icon={Globe} label="Website" href={site.legacyUrl}>
            {site.legacyUrl.replace(/^https:\/\//, "")}
          </ContactChip>
          <ContactChip icon={MapPin} label="Office">
            {fullAddress}
          </ContactChip>
        </div>
      </div>

      <div className="bg-purple-900 text-purple-100">
        <div className="site-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-purple-200/90">{footer.tagline}</p>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--gold-light)]">
              Quick Links
            </p>
            {footerNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-1.5 text-sm text-purple-200 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--gold-light)]">
              Follow Us
            </p>
            <div className="flex gap-3">
              {footer.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-bold hover:bg-[var(--gold)] hover:text-purple-900"
                  aria-label={item.label}
                >
                  {item.label[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/15">
          <div className="site-container flex flex-col items-center justify-between gap-3 py-5 text-xs text-purple-300 md:flex-row">
            <p>© {site.copyrightYear} {site.legalName}. All rights reserved.</p>
            <div className="flex gap-4">
              {footer.legal.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactChip({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: typeof Phone;
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal text-white shadow-md">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-wider text-purple-800">{label}</span>
        <span className="mt-0.5 block text-sm font-semibold text-purple-900">{children}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex items-center gap-3 hover:opacity-90">
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}
