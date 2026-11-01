import { ButtonLink } from "@/components/ui/ButtonLink";
import { liveHome } from "@/content/liveSite";

export function LiveHomeSections() {
  const live = liveHome;

  return (
    <>
      <section className="section-pad bg-sky">
        <div className="site-container max-w-4xl">
          <p className="eyebrow-purple">From Joy Together Home Care</p>
          <h2 className="font-display m-0 text-[clamp(30px,4vw,40px)] capitalize text-purple-900">
            {live.vision.title}
          </h2>
          <p className="body-muted mt-4">{live.vision.body}</p>
        </div>
      </section>

      <section className="section-pad bg-cream">
        <div className="site-container max-w-4xl">
          <h2 className="font-display m-0 text-[clamp(30px,4vw,40px)] text-purple-900">
            {live.experience.title}
          </h2>
          <div className="body-muted mt-6 space-y-4">
            {live.experience.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-purple-50">
        <div className="site-container grid gap-6 md:grid-cols-3">
          {live.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="card-soft border-t-4 border-[var(--gold)] p-7"
            >
              <h3 className="font-display m-0 text-xl text-purple-900">{pillar.title}</h3>
              <p className="body-muted mt-3 text-sm">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad bg-purple-900 text-white">
        <div className="site-container max-w-4xl">
          <h2 className="font-display m-0 text-3xl">Personalized care at home</h2>
          <p className="mt-5 leading-relaxed text-purple-100">{live.personalizedCare}</p>
          <div className="mt-8">
            <ButtonLink href="/contact" variant="gold" className="uppercase tracking-wide">
              Contact Us Today →
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
