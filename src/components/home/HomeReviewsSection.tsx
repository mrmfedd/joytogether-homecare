import { listPublishedTestimonials } from "@/lib/content/public";
import { contactReviews } from "@/content/contactReviews";
import { HomeReviewsCarousel } from "@/components/home/HomeReviewsCarousel";

export async function HomeReviewsSection() {
  const dbReviews = await listPublishedTestimonials();
  const reviews =
    dbReviews.length > 0
      ? dbReviews.map((t) => ({
          quote: t.quote,
          name: t.authorName,
          date: "",
        }))
      : contactReviews;

  return <HomeReviewsCarousel reviews={reviews} />;
}
