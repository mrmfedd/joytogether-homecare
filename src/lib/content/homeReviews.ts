import { contactReviews, type ContactReview } from "@/content/contactReviews";

export type HomeReviewSource = {
  quote: string;
  authorName: string;
  mediaAssetId?: string | null;
};

export type ResolvedHomeReview = {
  quote: string;
  name: string;
  date: string;
  imageUrl?: string;
};

/** CMS published testimonials win; otherwise static Google review fallback. */
export function resolveHomeReviews(
  dbReviews: HomeReviewSource[],
  mapMediaPath: (mediaAssetId: string) => string,
  fallback: ContactReview[] = contactReviews,
): ResolvedHomeReview[] {
  if (dbReviews.length > 0) {
    return dbReviews.map((t) => ({
      quote: t.quote,
      name: t.authorName,
      date: "",
      imageUrl: t.mediaAssetId ? mapMediaPath(t.mediaAssetId) : undefined,
    }));
  }

  return fallback.map((r) => ({
    quote: r.quote,
    name: r.name,
    date: r.date,
  }));
}

export function visibleHomeReviews(
  reviews: ResolvedHomeReview[],
  centerIndex: number,
  visibleCount: number,
): ResolvedHomeReview[] {
  if (reviews.length === 0) return [];
  const count = Math.min(visibleCount, reviews.length);
  return Array.from({ length: count }, (_, i) => {
    const offset = i - Math.floor(count / 2);
    return reviews[(centerIndex + offset + reviews.length) % reviews.length];
  });
}
