"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { contactReviews } from "@/content/contactReviews";
import { servicesHeadline } from "@/content/servicesCatalog";
import { site } from "@/content/site";

const AUTO_SCROLL_MS = 5500;
const REVIEW_COUNT = contactReviews.length;

function reviewAt(centerIndex: number, offset: number) {
  return contactReviews[(centerIndex + offset + REVIEW_COUNT) % REVIEW_COUNT];
}

export function TampaReviewsSection() {
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + REVIEW_COUNT) % REVIEW_COUNT);
    setSlideKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (hoverPaused) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % REVIEW_COUNT);
      setSlideKey((k) => k + 1);
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(id);
  }, [hoverPaused]);

  const visible = [reviewAt(index, -1), reviewAt(index, 0), reviewAt(index, 1)];

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20"
      aria-labelledby="home-reviews-heading"
      aria-roledescription="carousel"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <Image
        src={site.images.hero}
        alt=""
        fill
        className="object-cover object-center scale-105 blur-[2px]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-purple-900/70" aria-hidden />

      <div className="site-container relative z-[1]">
        <h2
          id="home-reviews-heading"
          className="font-display m-0 text-center text-lg font-semibold uppercase tracking-wide text-white md:text-2xl"
        >
          {servicesHeadline}
        </h2>

        <div className="relative mt-10 px-8 md:px-10">
          <button
            type="button"
            aria-label="Previous review"
            className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow transition hover:bg-white md:-left-2"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next review"
            className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow transition hover:bg-white md:-right-2"
            onClick={() => go(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            key={slideKey}
            className="reviews-slide-in grid items-stretch gap-4 md:grid-cols-3"
            aria-live="polite"
          >
            {visible.map((review, i) => {
              const center = i === 1;
              return (
                <article
                  key={`${review.name}-${review.date}-${center ? "center" : "side"}`}
                  className={`flex flex-col rounded-lg p-6 shadow-lg ${
                    center
                      ? "relative z-[1] bg-[var(--gold)] text-purple-900 md:scale-105"
                      : "bg-white text-purple-900"
                  }`}
                >
                  {!center && (
                    <div className="mb-3 flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  )}
                  <p className={`flex-1 text-sm leading-relaxed ${center ? "text-purple-900" : ""}`}>
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <p
                    className={`mt-4 font-bold uppercase ${center ? "text-purple-900" : "text-purple-800"}`}
                  >
                    {review.name}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Review slides">
          {contactReviews.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show review ${i + 1} of ${REVIEW_COUNT}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
              }`}
              onClick={() => {
                setIndex(i);
                setSlideKey((k) => k + 1);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
