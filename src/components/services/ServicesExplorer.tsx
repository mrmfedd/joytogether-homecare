"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  serviceCategories,
  type ServiceCategory,
} from "@/content/servicesCatalog";

export function ServicesExplorer() {
  const [active, setActive] = useState<ServiceCategory | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section id="services" className="section-pad scroll-mt-28 bg-purple-50">
      <div className="site-container min-w-0">
        <h2 className="font-display m-0 text-center text-2xl uppercase tracking-wide text-purple-900 md:text-3xl">
          Our Services
        </h2>
        <p className="body-muted mx-auto mt-3 max-w-2xl text-center text-sm sm:text-base">
          Tap a service to learn what we provide and how we can support your family at home.
        </p>

        <div className="mt-10 grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              id={cat.id}
              onClick={() => setActive(cat)}
              className="card-soft card-interactive group min-w-0 scroll-mt-28 overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
              aria-haspopup="dialog"
            >
              <div className="relative h-40 min-w-0 sm:h-44">
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 360px"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display m-0 text-xl text-purple-900">{cat.title}</h3>
                <p className="body-muted mt-2 line-clamp-2 text-sm">{cat.summary}</p>
                <span className="mt-3 inline-block text-sm font-bold text-purple-700">
                  View details →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-purple-900/55 p-0 sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActive(null);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
          >
            <div className="relative h-48 w-full sm:h-56">
              <Image
                src={active.image}
                alt=""
                fill
                className="object-cover"
                sizes="512px"
              />
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-purple-900 shadow-md hover:bg-white"
                aria-label="Close service details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <h3 id={titleId} className="font-display m-0 text-2xl text-purple-900">
                {active.title}
              </h3>
              <p id={descId} className="body-muted mt-3">
                {active.summary}
              </p>
              <ul className="mt-5 space-y-2.5">
                {active.highlights.map((item) => (
                  <li key={item} className="flex gap-2 text-sm font-medium text-purple-900">
                    <span className="mt-0.5 shrink-0 text-[var(--gold-dark)]" aria-hidden>
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/contact" variant="gold" className="w-full uppercase tracking-wide sm:w-auto">
                  Free Consultation
                </ButtonLink>
                {active.id === "heartsaver-pediatric" ? (
                  <ButtonLink href="/training" variant="outlinePurple" className="w-full sm:w-auto">
                    View Training
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
