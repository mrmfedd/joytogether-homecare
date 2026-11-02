import { describe, expect, it } from "vitest";
import { contactReviews } from "@/content/contactReviews";
import { resolveHomeReviews, visibleHomeReviews } from "@/lib/content/homeReviews";

describe("resolveHomeReviews", () => {
  it("uses CMS testimonials when published list is non-empty", () => {
    const resolved = resolveHomeReviews(
      [{ quote: "CMS quote", authorName: "CMS Author", mediaAssetId: "asset-1" }],
      (id) => `/api/media/${id}`,
    );
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.quote).toBe("CMS quote");
    expect(resolved[0]?.name).toBe("CMS Author");
    expect(resolved[0]?.imageUrl).toBe("/api/media/asset-1");
  });

  it("falls back to Google reviews when CMS list is empty", () => {
    const resolved = resolveHomeReviews([], () => "");
    expect(resolved).toHaveLength(contactReviews.length);
    expect(resolved[0]?.name).toBe(contactReviews[0]?.name);
    expect(resolved[0]?.quote).toBe(contactReviews[0]?.quote);
  });
});

describe("visibleHomeReviews", () => {
  const reviews = contactReviews.map((r) => ({ ...r }));

  it("wraps indices for carousel windows", () => {
    const window = visibleHomeReviews(reviews, 0, 3);
    expect(window).toHaveLength(3);
    expect(window[1]?.name).toBe(reviews[0]?.name);
  });

  it("shows a single card on narrow layouts", () => {
    const window = visibleHomeReviews(reviews, 2, 1);
    expect(window).toHaveLength(1);
    expect(window[0]?.name).toBe(reviews[2]?.name);
  });
});
