import { site } from "@/content/site";

export function ContactGoogleMap() {
  const query = encodeURIComponent(
    `${site.contact.address.line1}, ${site.contact.address.city}, ${site.contact.address.state} ${site.contact.address.zip}`,
  );

  return (
    <section className="section-pad pt-0" aria-label="Office location map">
      <div className="site-container">
        <h2 className="font-display m-0 mb-6 text-center text-2xl text-purple-900 md:text-3xl">
          Visit Our Office
        </h2>
        <div className="overflow-hidden rounded-xl border border-line shadow-md">
          <iframe
            title={`${site.name} — ${site.contact.address.city}, ${site.contact.address.state}`}
            src={`https://www.google.com/maps?q=${query}&z=15&output=embed`}
            className="aspect-[16/10] min-h-[280px] w-full md:min-h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          {site.contact.address.line1}, {site.contact.address.city},{" "}
          {site.contact.address.state} {site.contact.address.zip}
        </p>
      </div>
    </section>
  );
}
