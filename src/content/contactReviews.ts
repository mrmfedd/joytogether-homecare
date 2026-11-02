/**
 * Google reviews transcribed from JoyTogether’s public Google review UI captures.
 * Do not expand truncated quotes or assign dates unless verified on those captures.
 */

export type VerifiedGoogleReview = {
  id: string;
  name: string;
  quote: string;
  /** Present only when the date appeared on the captured Google review card. */
  date?: string;
  /** Only `5` when five stars were visible on the captured Google review card. */
  rating?: 5;
};

export const verifiedGoogleReviews: VerifiedGoogleReview[] = [
  {
    id: "google-frederick-2026-01-23",
    name: "Frederick",
    quote: "Thanks again! Gretha did a great job!!",
    date: "1/23/2026",
    rating: 5,
  },
  {
    id: "google-raymond-2021-08-05",
    name: "Raymond",
    quote: "Thank you. My caregiver was amazing and caring aid. She went…",
    date: "8/5/2021",
    rating: 5,
  },
  {
    id: "google-vanessa-2021-08-26",
    name: "Vanessa",
    quote: "Thank you for everything! The staffs were wonderful.",
    date: "8/26/2021",
    rating: 5,
  },
  {
    id: "google-nicholas-2026-01-23",
    name: "Nicholas",
    quote: "Arol is the best I appreciate him so very much!! I wish I could take hi…",
    date: "1/23/2026",
    rating: 5,
  },
  {
    id: "google-kathy",
    name: "Kathy",
    quote:
      "In the last few months Stocker have been taking care of my husband. They have been wonderful and very attentive.",
    rating: 5,
  },
  {
    id: "google-adriane",
    name: "Adriane",
    quote:
      "It has truly been a blessing to have Martin take such excellent care of my Mom. Thanks",
    rating: 5,
  },
  {
    id: "google-rob",
    name: "Rob",
    quote: "Services have been outstanding — very knowledgeable, kind, and reliable.",
    rating: 5,
  },
];

/** @deprecated Use verifiedGoogleReviews — kept for imports that expect contactReviews. */
export const contactReviews = verifiedGoogleReviews.map(({ name, quote, date }) => ({
  name,
  quote,
  date: date ?? "",
}));

export type ContactReview = (typeof contactReviews)[number];
