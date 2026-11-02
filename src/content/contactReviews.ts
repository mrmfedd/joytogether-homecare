export type ContactReview = {
  name: string;
  quote: string;
  date: string;
};

/** Google reviews used when no published CMS testimonials exist. */
export const contactReviews: ContactReview[] = [
  {
    name: "Frederick",
    quote: "Thanks again! Gretha did a great job!!",
    date: "1/23/2026",
  },
  {
    name: "Raymond",
    quote:
      "Thank you. My caregiver was amazing and caring aid. She went above and beyond for our family.",
    date: "8/5/2021",
  },
  {
    name: "Vanessa",
    quote: "Thank you for everything! The staffs were wonderful.",
    date: "8/26/2021",
  },
  {
    name: "Nicholas",
    quote:
      "Arol is the best I appreciate him so very much!! I wish I could take him everywhere with us.",
    date: "1/23/2026",
  },
  {
    name: "Kathy",
    quote:
      "In the last few months Stocker have been taking care of my husband. They have been wonderful and very attentive.",
    date: "8/5/2021",
  },
  {
    name: "Adriane",
    quote:
      "It has truly been a blessing to have Martin take such excellent care of my Mom. Thanks",
    date: "8/26/2021",
  },
  {
    name: "Rob",
    quote:
      "Services have been outstanding — very knowledgeable, kind, and reliable.",
    date: "1/23/2026",
  },
];
