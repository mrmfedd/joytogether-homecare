"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { servicesHeadline } from "@/content/servicesCatalog";
import { site } from "@/content/site";
import { visibleHomeReviews, type ResolvedHomeReview } from "@/lib/content/homeReviews";

export type HomeReview = ResolvedHomeReview;

const AUTO_SCROLL_MS = 5500;
const SWIPE_THRESHOLD_PX = 48;

function useVisibleCardCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      if (lg.matches) setCount(3);
      else if (sm.matches) setCount(2);
      else setCount(1);
    };
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);

  return count;
}

export function HomeReviewsCarousel({
  reviews,
  backdropSrc = site.images.hero,
  googleBusinessProfileUrl = site.googleBusinessProfileUrl,
}: {
  reviews: HomeReview[];
  backdropSrc?: string;
  googleBusinessProfileUrl?: string;
}) {
  const reviewCount = reviews.length;
  const visibleCount = useVisibleCardCount();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const go = useCallback(
    (delta: number) => {
      if (reviewCount < 2) return;
      setIndex((i) => (i + delta + reviewCount) % reviewCount);
      setSlideKey((k) => k + 1);
    },
    [reviewCount],
  );

  useEffect(() => {
    if (paused || reviewCount < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => go(1), AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [go, paused, reviewCount]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
        setSlideKey((k) => k + 1);
      } else if (event.key === "End") {
        event.preventDefault();
        setIndex(reviewCount - 1);
        setSlideKey((k) => k + 1);
      }
    },
    [go, reviewCount],
  );

  if (reviewCount === 0) return null;

  const visible = visibleHomeReviews(reviews, index, visibleCount);
  const centerIndex = Math.floor(visible.length / 2);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip overflow-y-visible py-16 md:py-20"
      aria-labelledby="home-reviews-heading"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!sectionRef.current?.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start == null) return;
        const delta = (event.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
        go(delta > 0 ? -1 : 1);
      }}
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
      <div className="site-container relative z-[1] max-w-full">
        <h2
          id="home-reviews-heading"
          className="font-display m-0 text-center text-lg font-semibold uppercase tracking-wide text-white md:text-2xl"
        >
          {servicesHeadline}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-purple-100">
          Approved client testimonials and verified Google reviews.{" "}
          <a
            href={googleBusinessProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-2 hover:text-purple-50"
          >
            View Joy Together on Google
          </a>
        </p>
        <div className="relative mt-10 px-12 sm:px-14 md:px-16">
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
          <div
            key={slideKey}
            className={`reviews-slide-in grid min-w-0 items-stretch gap-4 ${
              visibleCount === 1
                ? "grid-cols-1"
                : visibleCount === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 lg:grid-cols-3"
            }`}
            aria-live="polite"
          >
            {visible.map((review, i) => {
              const center = i === centerIndex;
              const showStars = !center && review.rating === 5;
              return (
                <article
                  key={`${review.id}-${i}`}
                  className={`flex min-w-0 flex-col rounded-lg p-6 shadow-lg ${
                    center
                      ? "relative z-[1] bg-[var(--gold)] text-purple-900 md:scale-[1.03]"
                      : "bg-white text-purple-900"
                  }`}
                  aria-roledescription="slide"
                  aria-label={`${review.sourceLabel} by ${review.name}`}
                >
                  {showStars && (
                    <p className="mb-3 flex gap-0.5 text-amber-400">
                      <span className="sr-only">5 out of 5 stars</span>
                      {Array.from({ length: review.rating! }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 shrink-0 fill-current" aria-hidden />
                      ))}
                    </p>
                  )}
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${center ? "text-purple-800" : "text-purple-600"}`}
                  >
                    {review.sourceLabel}
                  </p>
                  <p className="mt-2 flex-1 break-words text-sm leading-relaxed">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <p className="mt-4 font-bold uppercase">{review.name}</p>
                  {review.date ? (
                    <p className="mt-1 text-xs text-purple-700/80">{review.date}</p>
                  ) : null}
                  {review.source === "google" && review.sourceHref ? (
                    <a
                      href={review.sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-xs font-semibold text-purple-700 underline underline-offset-2 hover:text-purple-900"
                    >
                      View on Google
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 px-4">
          {reviews.map((review, i) => (
            <button
              key={review.id}
              type="button"
              aria-label={`Show review ${i + 1} of ${reviewCount}, ${review.name}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/40"
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
