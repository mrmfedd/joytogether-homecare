"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { liveTestimonials, servicesHeadline } from "@/content/servicesCatalog";

type Review = (typeof liveTestimonials)[number] & { featured?: boolean };

export function TampaReviewsSection() {
  const reviews = liveTestimonials as Review[];
  const [index, setIndex] = useState(1);

  function go(delta: number) {
    setIndex((i) => (i + delta + reviews.length) % reviews.length);
  }

  const visible = [
    reviews[(index - 1 + reviews.length) % reviews.length],
    reviews[index],
    reviews[(index + 1) % reviews.length],
  ];

  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <Image
        src="/assets/services/testimonials-hero.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-purple-900/55" />
      <div className="site-container relative z-[1]">
        <h2 className="font-display m-0 text-center text-lg font-semibold uppercase tracking-wide text-white md:text-2xl">
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

          <div className="grid items-stretch gap-4 md:grid-cols-3">
            {visible.map((review, i) => {
              const center = i === 1;
              return (
                <article
                  key={`${review.name}-${i}`}
                  className={`flex flex-col rounded-lg p-6 shadow-lg ${
                    center
                      ? "bg-[#0099e5] text-white md:scale-105"
                      : "bg-white text-purple-900"
                  }`}
                >
                  {!center && (
                    <div className="mb-3 flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  )}
                  <p className={`flex-1 text-sm leading-relaxed ${center ? "text-white" : ""}`}>
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <p className={`mt-4 font-bold uppercase ${center ? "text-white/95" : "text-purple-800"}`}>
                    {review.name}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
