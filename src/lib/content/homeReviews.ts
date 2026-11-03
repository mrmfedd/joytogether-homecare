import {
  verifiedGoogleReviews,
  type VerifiedGoogleReview,
} from "@/content/contactReviews";

export type ReviewSource = "google" | "cms";

export type HomeReviewSource = {
  id: string;
  quote: string;
  authorName: string;
  mediaAssetId?: string | null;
};

export type ResolvedHomeReview = {
  id: string;
  quote: string;
  name: string;
  date?: string;
  imageUrl?: string;
  source: ReviewSource;
  rating?: 5;
  sourceHref?: string;
  sourceLabel: string;
};

function normalizeQuote(quote: string) {
  return quote
    .toLowerCase()
    .replace(/\u2026/g, "")
    .replace(/…/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeReviewKey(name: string, quote: string) {
  return `${name.toLowerCase().trim()}|${normalizeQuote(quote).slice(0, 96)}`;
}

function quotesAreDuplicate(nameA: string, quoteA: string, nameB: string, quoteB: string) {
  if (nameA.toLowerCase().trim() !== nameB.toLowerCase().trim()) return false;
  const a = normalizeQuote(quoteA);
  const b = normalizeQuote(quoteB);
  if (!a || !b) return false;
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return longer.startsWith(shorter) && shorter.length >= 24;
}

function mapGoogleReview(
  review: VerifiedGoogleReview,
  googleReviewsUrl: string,
): ResolvedHomeReview {
  return {
    id: review.id,
    quote: review.quote,
    name: review.name,
    date: review.date,
    source: "google",
    rating: review.rating,
    sourceHref: googleReviewsUrl,
    sourceLabel: "Google review",
  };
}

/**
 * Merges approved CMS testimonials with verified Google reviews.
 * CMS entries come first; Google entries skip duplicates of CMS text.
 */
export function resolveHomeReviews(
  dbReviews: HomeReviewSource[],
  mapMediaPath: (mediaAssetId: string) => string,
  googleReviewsUrl: string,
  googleCatalog: VerifiedGoogleReview[] = verifiedGoogleReviews,
): ResolvedHomeReview[] {
  const merged: ResolvedHomeReview[] = [];

  for (const t of dbReviews) {
    merged.push({
      id: `cms-${t.id}`,
      quote: t.quote,
      name: t.authorName,
      source: "cms",
      sourceLabel: "Approved client testimonial",
      imageUrl: t.mediaAssetId ? mapMediaPath(t.mediaAssetId) : undefined,
    });
  }

  for (const review of googleCatalog) {
    const duplicateOfCms = dbReviews.some((t) =>
      quotesAreDuplicate(t.authorName, t.quote, review.name, review.quote),
    );
    if (duplicateOfCms) continue;
    merged.push(mapGoogleReview(review, googleReviewsUrl));
  }

  return merged;
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

export { normalizeReviewKey, quotesAreDuplicate };
