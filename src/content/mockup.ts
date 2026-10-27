import { site } from "@/content/site";

export const home = {
  hero: {
    eyebrow: "Compassionate Care. Brighter Days.",
    title: "Joy Together Home Care",
    subtitle:
      "Trusted in-home care in Tampa, FL — compassionate hospice and home care throughout the Greater Tampa Bay area.",
    primaryCta: { label: "Request a Free Consultation →", href: "/contact" },
    secondaryCta: { label: "Learn More", href: "/about" },
  },
  features: [
    {
      title: "Compassionate Caregivers",
      description:
        "Dedicated, dependable professionals focused on kindness and dignity.",
    },
    {
      title: "Personalized Care Plans",
      description: "Support tailored to unique needs, routines, and preferences.",
    },
    {
      title: "Greater Independence",
      description: "Helping loved ones stay confident and comfortable at home.",
    },
    {
      title: "A Happier, Healthier Life",
      description: "Gentle encouragement, connection, and everyday wellbeing.",
    },
  ],
  aboutTeaser: {
    eyebrow: "The Joy Together Difference",
    title: "Care That Feels Like Family",
    body:
      "At Joy Together Home Care, we believe everyone deserves to feel valued, safe, and supported. Our approach puts people first — with thoughtful assistance that respects each individual's preferences, routines, and independence.",
    bullets: [
      "Trauma-informed care",
      "Trusted, experienced caregivers",
      "24/7 support when you need it",
      "Individual-focused attention",
    ],
    cta: { label: "Our Story →", href: "/about" },
    scribble: "People Care Belong Together",
  },
  servicesTeaser: {
    eyebrow: "Our Home Care Services",
    title: "Flexible Care for Life's Changing Needs",
    intro:
      "Explore non-medical home care services that help your loved one feel comfortable, connected, and supported.",
    cards: [
      {
        id: "companionship",
        title: "Companion Care",
        description:
          "Meaningful conversation, friendly visits, and activities that brighten the day.",
        image: site.images.services.companionship,
      },
      {
        id: "personal-care",
        title: "Personal Care",
        description:
          "Respectful assistance with bathing, dressing, grooming, and daily routines.",
        image: site.images.services.personalCare,
      },
      {
        id: "housekeeping",
        title: "Light Household Help",
        description:
          "Keeping living spaces tidy, organized, and comfortable with light housekeeping.",
        image: site.images.services.housekeeping,
      },
      {
        id: "respite",
        title: "Respite Care",
        description:
          "Temporary support so family caregivers can rest, recharge, and return refreshed.",
        image: site.images.services.respite,
      },
    ],
    viewAll: { label: "View All Services →", href: "/services" },
  },
  whyTeaser: {
    eyebrow: "Why Families Choose Us",
    title: "A Higher Standard of Home Care",
    items: [
      {
        title: "Trusted & Compassionate Caregivers",
        description: "Bonded, insured, and carefully screened professionals.",
      },
      {
        title: "Personalized Approach",
        description: "Care plans built around your loved one's unique needs.",
      },
      {
        title: "Independence & Dignity",
        description: "Respectful support that helps people feel at home.",
      },
      {
        title: "Peace of Mind for Families",
        description: "Clear communication and dependable 24/7 availability.",
      },
    ],
    quote: "Together we make every day a little brighter.",
    cta: { label: "About Us →", href: "/about" },
  },
  testimonials: {
    eyebrow: "Real Stories. Brighter Days.",
    title: "Families Who Found Joy Together",
    items: [
      {
        quote:
          "The caregivers treated my mother like family. She looks forward to every visit, and we finally have peace of mind.",
        name: "Sarah L.",
        role: "Daughter of Client",
      },
      {
        quote:
          "Professional, warm, and reliable. Joy Together helped Dad stay in his home with dignity and real companionship.",
        name: "Michael R.",
        role: "Son of Client",
      },
      {
        quote:
          "From the first consultation to daily care, the team listened to what mattered most to us. We are grateful.",
        name: "Patricia W.",
        role: "Family Caregiver",
      },
    ],
  },
  cta: {
    title: "Let's Bring More Joy to Today",
    subtitle:
      "Discover compassionate home care designed around the people you love.",
    button: { label: "Request a Free Consultation →", href: "/contact" },
  },
};

export const footer = {
  tagline: "Compassionate care. Brighter days. Together.",
  social: [
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};
