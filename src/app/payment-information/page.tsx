import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { livePayment } from "@/content/liveSite";

export const metadata: Metadata = {
  title: "Payment Information",
  description: livePayment.intro,
};

export default function PaymentInformationPage() {
  const p = livePayment;

  return (
    <>
      <PageHero title={p.title} description={p.intro} />
      <section className="section-pad">
        <div className="site-container max-w-3xl">
          <p className="body-muted">{p.body}</p>
          <h2 className="font-display mt-10 text-2xl text-purple-900">{p.insuranceTitle}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {p.insurances.map((item) => (
              <li
                key={item}
                className="card-soft px-4 py-3 text-sm font-semibold text-purple-900"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="body-muted mt-8">
            Questions about billing or insurance?{" "}
            <Link href="/contact" className="font-bold text-purple-700 hover:underline">
              Contact our team →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
