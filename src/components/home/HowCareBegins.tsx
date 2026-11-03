import { Reveal } from "@/components/motion/Reveal";

const steps = [
  {
    n: "01",
    title: "Contact JoyTogether",
    body: "Call, email, or send a consultation request. Tell us who needs support and what you are exploring.",
  },
  {
    n: "02",
    title: "Discuss Your Needs",
    body: "We listen to goals, preferences, and timing — without collecting sensitive clinical records through marketing forms.",
  },
  {
    n: "03",
    title: "Review Available Options",
    body: "Explore skilled nursing, hospice, private duty, or other support pathways that may fit your situation.",
  },
  {
    n: "04",
    title: "Arrange Appropriate Services",
    body: "Next steps follow required discussions, assessments, and eligibility checks before care begins.",
  },
];

export function HowCareBegins() {
  return (
    <section className="section-pad bg-white">
      <div className="site-container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow-purple">Getting Started</p>
          <h2 className="font-display m-0 text-[clamp(30px,4vw,46px)] text-purple-900">
            How Care Begins
          </h2>
          <p className="body-muted mt-4">
            A clear process — without implying that services start before required assessments or
            eligibility checks.
          </p>
        </Reveal>
        <ol className="mt-12 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal
              key={step.n}
              as="li"
              delay={i * 90}
              className="relative h-full rounded-3xl border border-line bg-cream p-6"
            >
              <span className="font-display text-3xl text-[var(--royal)]">{step.n}</span>
              <h3 className="font-display m-0 mt-3 text-xl text-purple-900">{step.title}</h3>
              <p className="body-muted mt-2 text-sm leading-relaxed">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
