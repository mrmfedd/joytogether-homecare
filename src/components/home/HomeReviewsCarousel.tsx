"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { servicesHeadline } from "@/content/servicesCatalog";
import { site } from "@/content/site";

export type HomeReview = { name: string; quote: string; date?: string; imageUrl?: string };

const AUTO_SCROLL_MS = 5500;

export function HomeReviewsCarousel({
  reviews,
  backdropSrc = site.images.hero,
}: {
  reviews: HomeReview[];
  backdropSrc?: string;
}) {
  const reviewCount = reviews.length;
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const reviewAt = useCallback(
    (centerIndex: number, offset: number) => reviews[(centerIndex + offset + reviewCount) % reviewCount],
    [reviews, reviewCount],
  );

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + reviewCount) % reviewCount);
      setSlideKey((k) => k + 1);
    },
    [reviewCount],
  );

  useEffect(() => {
    if (hoverPaused || reviewCount < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % reviewCount);
      setSlideKey((k) => k + 1);
    }, AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [hoverPaused, reviewCount]);

  if (reviewCount === 0) return null;

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
        src={backdropSrc}
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        unoptimized={backdropSrc.startsWith("/api/")}
      />
      <div className="absolute inset-0 bg-purple-900/70" aria-hidden />
      <div className="site-container relative z-[1]">
        <h2
          id="home-reviews-heading"
          className="font-display m-0 text-center text-lg font-semibold uppercase tracking-wide text-white md:text-2xl"
        >
          {servicesHeadline}
        </h2>
        <div className="relative mt-10 md:px-4">
          <button
            type="button"
            aria-label="Previous review"
            className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next review"
            className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow"
            onClick={() => go(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div key={slideKey} className="reviews-slide-in grid items-stretch gap-4 md:grid-cols-3" aria-live="polite">
            {visible.map((review, i) => {
              const center = i === 1;
              return (
                <article
                  key={`${review.name}-${i}`}
                  className={`flex flex-col rounded-lg p-6 shadow-lg ${
                    center ? "relative z-[1] bg-[var(--gold)] text-purple-900 md:scale-105" : "bg-white text-purple-900"
                  }`}
                >
                  {!center && (
                    <div className="mb-3 flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  )}
                  <p className="flex-1 text-sm leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
                  <p className="mt-4 font-bold uppercase">{review.name}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
