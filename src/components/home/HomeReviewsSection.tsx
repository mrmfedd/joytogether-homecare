import { listPublishedTestimonials } from "@/lib/content/public";
import { contactReviews } from "@/content/contactReviews";
import { HomeReviewsCarousel } from "@/components/home/HomeReviewsCarousel";
import { mediaPublicPath } from "@/lib/storage/media";
import { site } from "@/content/site";

export async function HomeReviewsSection() {
  const dbReviews = await listPublishedTestimonials();
  const reviews =
    dbReviews.length > 0
      ? dbReviews.map((t) => ({
          quote: t.quote,
          name: t.authorName,
          date: "",
          imageUrl: t.mediaAssetId ? mediaPublicPath(t.mediaAssetId) : undefined,
        }))
      : contactReviews;

  const backdrop =
    dbReviews.find((t) => t.mediaAssetId)?.mediaAssetId != null
      ? mediaPublicPath(dbReviews.find((t) => t.mediaAssetId)!.mediaAssetId!)
      : site.images.hero;

  return <HomeReviewsCarousel reviews={reviews} backdropSrc={backdrop} />;
}
