import { MarketingImage } from "@/components/services/MarketingImage";

export function ServiceListSection({
  title,
  intro,
  items,
  columns,
  image,
  imageAlt,
  variant = "light",
  id,
}: {
  title: string;
  intro?: string;
  items?: string[];
  columns?: string[][];
  image?: string;
  imageAlt?: string;
  variant?: "light" | "brand" | "purple";
  id?: string;
}) {
  const bg =
    variant === "brand"
      ? "bg-[#0099e5] text-purple-950"
      : variant === "purple"
        ? "bg-purple-50"
        : "bg-white";

  return (
    <section id={id} className={`section-pad scroll-mt-28 ${bg}`}>
      <div className="site-container min-w-0">
        <h2 className="font-display m-0 mb-6 text-center text-2xl uppercase tracking-wide text-purple-900 md:text-3xl">
          {title}
        </h2>
        <div
          className={`grid min-w-0 items-start gap-8 md:gap-10 ${image ? "lg:grid-cols-2" : ""}`}
        >
          {image ? (
            <div className="min-w-0">
              <MarketingImage src={image} alt={imageAlt ?? title} />
            </div>
          ) : null}
          <div className="min-w-0">
            {intro ? <p className="body-muted mb-5 leading-relaxed">{intro}</p> : null}
            {items ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm font-medium text-purple-900">
                    <span className="shrink-0 text-sage">•</span>
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {columns ? (
              <div className="grid min-w-0 gap-8 sm:grid-cols-2">
                {columns.map((col, i) => (
                  <ul key={i} className="min-w-0 space-y-2">
                    {col.map((item) => (
                      <li key={item} className="flex gap-2 text-sm font-medium text-purple-900">
                        <span className="shrink-0 text-sage">•</span>
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
