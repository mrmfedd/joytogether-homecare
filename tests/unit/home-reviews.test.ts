import { describe, expect, it } from "vitest";
import { verifiedGoogleReviews } from "@/content/contactReviews";
import {
  quotesAreDuplicate,
  resolveHomeReviews,
  visibleHomeReviews,
} from "@/lib/content/homeReviews";

const googleUrl = "https://example.com/google";

describe("resolveHomeReviews", () => {
  it("merges CMS testimonials with Google reviews", () => {
    const resolved = resolveHomeReviews(
      [{ id: "1", quote: "CMS-only quote", authorName: "CMS Author" }],
      () => "",
      googleUrl,
    );
    expect(resolved.length).toBe(verifiedGoogleReviews.length + 1);
    expect(resolved[0]?.source).toBe("cms");
    expect(resolved[0]?.sourceLabel).toBe("Approved client testimonial");
    expect(resolved.some((r) => r.source === "google")).toBe(true);
  });

  it("deduplicates Google entries that match CMS quote text", () => {
    const duplicateQuote = verifiedGoogleReviews[0]!.quote;
    const resolved = resolveHomeReviews(
      [{ id: "1", quote: duplicateQuote, authorName: "Frederick" }],
      () => "",
      googleUrl,
    );
    const googleFrederick = resolved.filter(
      (r) => r.source === "google" && r.name === "Frederick",
    );
    expect(googleFrederick).toHaveLength(0);
    expect(resolved).toHaveLength(verifiedGoogleReviews.length);
  });

  it("uses Google catalog when CMS list is empty", () => {
    const resolved = resolveHomeReviews([], () => "", googleUrl);
    expect(resolved).toHaveLength(verifiedGoogleReviews.length);
    expect(resolved[0]?.source).toBe("google");
    expect(resolved[0]?.sourceHref).toBe(googleUrl);
  });
});

describe("quotesAreDuplicate", () => {
  it("matches truncated Google text to a longer CMS quote for the same author", () => {
    expect(
      quotesAreDuplicate(
        "Raymond",
        "Thank you. My caregiver was amazing and caring aid. She went above and beyond.",
        "Raymond",
        "Thank you. My caregiver was amazing and caring aid. She went…",
      ),
    ).toBe(true);
  });
});

describe("visibleHomeReviews", () => {
  const reviews = resolveHomeReviews([], () => "", googleUrl);

  it("wraps indices for carousel windows", () => {
    const window = visibleHomeReviews(reviews, 0, 3);
    expect(window).toHaveLength(3);
    expect(window[1]?.id).toBe(reviews[0]?.id);
  });

  it("shows a single card on narrow layouts", () => {
    const window = visibleHomeReviews(reviews, 2, 1);
    expect(window).toHaveLength(1);
    expect(window[0]?.id).toBe(reviews[2]?.id);
  });
});
