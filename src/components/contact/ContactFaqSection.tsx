import { listPublishedFaqs } from "@/lib/content/public";

export async function ContactFaqSection() {
  const faqs = await listPublishedFaqs();
  if (faqs.length === 0) return null;

  return (
    <section className="section-pad bg-[var(--cream)]">
      <div className="site-container max-w-3xl">
        <h2 className="font-display text-3xl text-purple-900">Frequently asked questions</h2>
        <ul className="mt-8 space-y-4">
          {faqs.map((f) => (
            <li key={f.id} className="rounded-2xl border border-line bg-white p-5">
              <p className="font-semibold text-purple-900">{f.question}</p>
              <p className="mt-2 text-sm text-muted">{f.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
