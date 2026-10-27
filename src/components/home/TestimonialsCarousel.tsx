"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";

type Item = {
  quote: string;
  name: string;
  role: string;
};

export function TestimonialsCarousel({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          className="absolute -left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-purple-700 shadow-md hover:bg-purple-50 md:-left-5"
          aria-label="Previous testimonial"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="absolute -right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-purple-700 shadow-md hover:bg-purple-50 md:-right-5"
          aria-label="Next testimonial"
          onClick={() => go(1)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((offset) => {
            const item = items[(index + offset) % count];
            return (
              <article
                key={`${item.name}-${offset}`}
                className="card-soft p-7 transition-opacity"
              >
                <div className="mb-4 flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-[15px] leading-relaxed text-purple-900">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="mt-5 font-bold text-purple-800">{item.name}</p>
                <p className="text-sm text-muted">{item.role}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to testimonial set ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-8 bg-purple-600" : "w-2.5 bg-purple-200"
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
