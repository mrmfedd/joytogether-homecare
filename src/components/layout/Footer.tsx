import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { footer } from "@/content/mockup";
import { footerNavLinks } from "@/content/navigation";
import { site } from "@/content/site";

export function Footer() {
  const { address, phone, phoneHref, email, emailHref } = site.contact;
  const fullAddress = `${address.line1}, ${address.city}, ${address.state} ${address.zip}`;

  return (
    <footer className="mt-auto bg-purple-900 text-purple-100">
      <div className="site-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-purple-200/90">{footer.tagline}</p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Quick Links
          </h4>
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
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Contact Us
          </h4>
          <p className="flex gap-2 text-sm">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
            <a href={phoneHref} className="hover:text-white">{phone}</a>
          </p>
          <p className="mt-2 flex gap-2 text-sm">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
            <a href={emailHref} className="break-all hover:text-white">{email}</a>
          </p>
          <p className="mt-2 flex gap-2 text-sm text-purple-200">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
            <span>{fullAddress}</span>
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Follow Us
          </h4>
          <div className="flex gap-3">
            {footer.social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-bold hover:bg-white/20"
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
    </footer>
  );
}
