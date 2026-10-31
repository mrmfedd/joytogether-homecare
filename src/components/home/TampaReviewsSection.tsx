"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { contactReviews } from "@/content/contactReviews";
import { servicesHeadline } from "@/content/servicesCatalog";

const AUTO_SCROLL_MS = 6000;

function reviewAt(index: number, offset: number) {
  const reviews = contactReviews;
  return reviews[(index + offset + reviews.length) % reviews.length];
}

export function TampaReviewsSection() {
  const reviews = contactReviews;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + reviews.length) % reviews.length);
    },
    [reviews.length],
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => go(1), AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [go, paused]);

  const visible = [reviewAt(index, -1), reviewAt(index, 0), reviewAt(index, 1)];

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20"
      aria-labelledby="home-reviews-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <Image
        src="/assets/services/testimonials-hero.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-purple-900/55" />
      <div className="site-container relative z-[1]">
        <h2
          id="home-reviews-heading"
          className="font-display m-0 text-center text-lg font-semibold uppercase tracking-wide text-white md:text-2xl"
        >
          {servicesHeadline}
        </h2>

        <div className="relative mt-10">
          <button
            type="button"
            aria-label="Previous review"
            className="absolute -left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow md:-left-4"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next review"
            className="absolute -right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow md:-right-4"
            onClick={() => go(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div key={`review-set-${index}`} className="grid items-stretch gap-4 md:grid-cols-3">
            {visible.map((review, i) => {
              const center = i === 1;
              return (
                <article
                  key={`${review.name}-${review.date}-${i}`}
                  className={`review-card-enter flex flex-col rounded-lg p-6 shadow-lg transition-transform ${
                    center
                      ? "bg-[#0099e5] text-white md:scale-105"
                      : "bg-white text-purple-900"
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {!center && (
                    <div className="mb-3 flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  )}
                  <p className={`flex-1 text-sm leading-relaxed ${center ? "text-white" : ""}`}>
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <p
                    className={`mt-4 font-bold uppercase ${center ? "text-white/95" : "text-purple-800"}`}
                  >
                    {review.name}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show reviews starting at ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/40"
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
