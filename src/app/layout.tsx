import type { Metadata } from "next";
import { DM_Sans, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PageShell } from "@/components/layout/PageShell";
import { site } from "@/content/site";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | The Art of Caring`,
    template: `%s | ${site.name}`,
  },
  description:
    "JoyTogether Home Care provides skilled nursing, hospice care, and private duty options for families across the Greater Tampa Bay area.",
  metadataBase: new URL(site.url),
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} | The Art of Caring`,
    description:
      "Skilled nursing, hospice care, and private duty support — compassion that feels like family.",
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeHealthCareService",
  name: site.legalName,
  url: site.url,
  telephone: site.contact.phone,
  email: site.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.line1,
    addressLocality: site.contact.address.city,
    addressRegion: site.contact.address.state,
    postalCode: site.contact.address.zip,
    addressCountry: "US",
  },
  areaServed: site.contact.serviceArea,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
