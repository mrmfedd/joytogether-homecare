import { HeartHandshake, MessageCircleHeart, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const items = [
  {
    icon: HeartHandshake,
    title: "Compassionate Approach",
    body: "We lead with empathy, patience, and respect for each person’s dignity and preferences.",
  },
  {
    icon: Sparkles,
    title: "Personalized Service",
    body: "Care conversations start with your goals — clinical, comfort-focused, or private-pay daily support.",
  },
  {
    icon: ShieldCheck,
    title: "Professional Care",
    body: "Licensed clinical pathways and thoughtfully arranged nonmedical support, explained clearly and honestly.",
  },
  {
    icon: MessageCircleHeart,
    title: "Family Communication",
    body: "Families stay informed. We focus on clarity, comfort, and next steps you can act on.",
  },
];

export function WhyFamilies() {
  return (
    <section className="section-pad bg-sky">
      <div className="site-container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow-purple">Why Families Choose JoyTogether</p>
          <h2 className="font-display m-0 text-[clamp(30px,4vw,46px)] text-purple-900">
            Care That Puts People First
          </h2>
          <p className="body-muted mt-4">
            We highlight values we practice every day. Claims about specific accreditations,
            certifications, or guarantees appear only when verified.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <article className="rounded-3xl border border-line bg-white p-7 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--sage-light)] text-[var(--joy-green-dark)]">
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-display m-0 mt-4 text-xl text-purple-900">{item.title}</h3>
                <p className="body-muted mt-2 text-sm leading-relaxed">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
