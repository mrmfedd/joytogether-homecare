import { ButtonLink } from "@/components/ui/ButtonLink";

export function PageHero({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="page-hero">
      <div className="site-container max-w-3xl">
        {eyebrow ? <p className="eyebrow-purple">{eyebrow}</p> : null}
        <h1 className="font-display">{title}</h1>
        {description ? <p className="body-muted m-0">{description}</p> : null}
        {cta ? (
          <div className="mt-8">
            <ButtonLink href={cta.href} variant="purple">{cta.label}</ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
