/** Service catalog from joytogetherhomecare.com marketing materials */

import { site } from "@/content/site";

export const servicesHeadline =
  "Joy Together Homecare: In-Home Care Services in Tampa, FL";

export type ServiceCategory = {
  id: string;
  title: string;
  image: string;
  summary: string;
  highlights: string[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: "personal-care-services",
    title: "Personal Care Services",
    image: site.images.services.personalCare,
    summary:
      "Respectful help with daily living so your loved one can stay comfortable, clean, and confident at home.",
    highlights: [
      "Bathing, dressing, and grooming assistance",
      "Medication reminders",
      "Toileting and incontinence support",
      "Feeding and special diet assistance",
      "Transferring, positioning, and ambulation help",
      "Live-in assistance when needed",
    ],
  },
  {
    id: "home-care",
    title: "Home Care & Private Duty",
    image: "/assets/services/home-care-private-duty.jpg",
    summary:
      "Personalized private-duty home care that helps seniors stay safe, independent, and comfortable in familiar surroundings — with flexible support from a few hours a week to live-in and 24-hour care.",
    highlights: [
      "One-on-one private duty care matched to your loved one’s needs",
      "Assistance with bathing, dressing, and grooming",
      "Live-in and 24-hour care options for continuous support",
      "Fall prevention and safety supervision at home",
      "Meal preparation, light housekeeping, and laundry",
      "Medication reminders and everyday routine support",
      "Companionship that supports emotional well-being and recovery",
      "Reliable backup caregivers for family peace of mind",
    ],
  },
  {
    id: "heartsaver-pediatric",
    title: "Heartsaver® Pediatric",
    image: "/assets/service-companion.jpg",
    summary:
      "Pediatric CPR and First Aid training for childcare workers, educators, parents, and community members.",
    highlights: [
      "Heartsaver® Pediatric CPR & First Aid courses",
      "Hands-on emergency response skills",
      "AHA or ASHI approved certification",
      "Group and on-site training available",
      "Recertification options for renewals",
      "See our Training page for course details",
    ],
  },
  {
    id: "errands-transportation",
    title: "Errands & Transportation",
    image: "/assets/services/errands-transport.jpg",
    summary:
      "Reliable local help with the trips and tasks that keep everyday life running smoothly.",
    highlights: [
      "Grocery and clothes shopping",
      "Picking up prescriptions",
      "Accompanying to physician or personal appointments",
      "Local transportation with insured drivers",
      "Taking out garbage and answering the door",
      "Reading mail and light daily errands",
    ],
  },
  {
    id: "rn-lpn",
    title: "RN / LPN",
    image: "/assets/services/rn-lpn-care.jpg",
    summary:
      "Skilled nursing support from RNs and LPNs for clinical needs that require trained professionals.",
    highlights: [
      "Wound care and post-surgical care",
      "Medication management and diabetic teaching",
      "Cardiovascular, pulmonary, and oncology care",
      "Alzheimer's / Dementia and stroke care",
      "Pain management and neurology support",
      "Critical thinking with compassionate bedside manner",
    ],
  },
  {
    id: "other-work",
    title: "Other Work",
    image: "/assets/services/other-work-companion.jpg",
    summary:
      "Companionship, activities, and monitoring that brighten the day and support independence.",
    highlights: [
      "Companionship, conversation, and board games",
      "Reading, puzzles, arts and crafts",
      "Cooking together and watching TV",
      "Respite care for family caregivers",
      "Medication reminders and grooming assistance",
      "Monitoring client activity and live-in services",
    ],
  },
];

export type PartnerLogo = {
  id: string;
  name: string;
  description: string;
  href: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
};

export type PartnerPlace = {
  id: string;
  name: string;
  description: string;
  href: string;
  image: string;
};

export const partners: Array<PartnerLogo | PartnerPlace> = [
  {
    id: "apd-cares",
    name: "APDCares",
    description: "Agency for Persons with Disabilities — connecting you to the community",
    href: "https://apd.myflorida.com/",
    logo: "/assets/partners/apd-cares.png",
    logoWidth: 331,
    logoHeight: 201,
  },
  {
    id: "tampa",
    name: "Tampa",
    description: "Proudly serving families across the Greater Tampa Bay area",
    href: "/contact",
    image: site.images.about,
  },
  {
    id: "florida-health",
    name: "Florida Department of Health",
    description: "Aligned with Florida public health standards for community care",
    href: "https://www.floridahealth.gov/",
    logo: "/assets/partners/florida-health.png",
    logoWidth: 171,
    logoHeight: 193,
  },
];
