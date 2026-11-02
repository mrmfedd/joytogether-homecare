import { listPublishedTestimonials } from "@/lib/content/public";
import { resolveHomeReviews } from "@/lib/content/homeReviews";
import { HomeReviewsCarousel } from "@/components/home/HomeReviewsCarousel";
import { mediaPublicPath } from "@/lib/storage/media";
import { site } from "@/content/site";

export async function HomeReviewsSection() {
  const dbReviews = await listPublishedTestimonials();
  const reviews = resolveHomeReviews(
    dbReviews.map((t) => ({
      quote: t.quote,
      authorName: t.authorName,
      mediaAssetId: t.mediaAssetId,
    })),
    mediaPublicPath,
  );

  const backdrop =
    dbReviews.find((t) => t.mediaAssetId)?.mediaAssetId != null
      ? mediaPublicPath(dbReviews.find((t) => t.mediaAssetId)!.mediaAssetId!)
      : site.images.hero;

  return <HomeReviewsCarousel reviews={reviews} backdropSrc={backdrop} />;
}
