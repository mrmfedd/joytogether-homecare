/** Confirmed major care experiences + supporting service pages.
 * Clinical availability depends on assessment, licensing scope, and individual circumstances.
 * License numbers and payer claims require management verification before publishing specifics.
 */

export const majorCareExperiences = [
  {
    id: "skilled-nursing",
    href: "/services/skilled-nursing",
    title: "Skilled Nursing",
    eyebrow: "Clinical Care",
    tagline: "Professional Clinical Care in the Comfort of Home.",
    summary:
      "Licensed nursing support designed to help individuals manage clinical needs at home — with care plans coordinated around comfort, safety, and family communication.",
    image: "/assets/services/skilled-nursing-care.jpg",
    accent: "navy" as const,
  },
  {
    id: "hospice-care",
    href: "/services/hospice-care",
    title: "Hospice Care",
    eyebrow: "Comfort & Dignity",
    tagline: "Comfort, Dignity, and Compassion Every Step of the Way.",
    summary:
      "Compassionate end-of-life support focused on quality of life, emotional comfort, family involvement, and respectful coordination with healthcare professionals.",
    image: "/assets/services/home-care-nursing.jpg",
    accent: "sky" as const,
  },
  {
    id: "private-duty-care",
    href: "/services/private-duty-care",
    title: "Private Duty Care",
    eyebrow: "Private Pay Options",
    tagline: "Personalized Care Options, Even Without Insurance.",
    summary:
      "Private-pay caregiving for individuals and families seeking personalized in-home support without relying on insurance coverage.",
    image: "/assets/services/home-care-private-duty.jpg",
    accent: "green" as const,
    featured: true,
  },
] as const;

export type ServiceLanding = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  headline: string;
  intro: string;
  image: string;
  whoFor: string[];
  mayInclude: string[];
  howToBegin: string[];
  faqs: { q: string; a: string }[];
  disclaimer?: string;
  category: "clinical" | "hospice" | "private-duty" | "support";
};

export const serviceLandings: ServiceLanding[] = [
  {
    slug: "skilled-nursing",
    title: "Skilled Nursing",
    seoTitle: "Skilled Nursing Care at Home in Tampa Bay",
    seoDescription:
      "Explore JoyTogether Home Care skilled nursing support provided by licensed healthcare professionals in the Greater Tampa Bay area.",
    eyebrow: "Skilled Nursing Care",
    headline: "Professional Clinical Care in the Comfort of Home",
    intro:
      "JoyTogether Home Care is licensed to provide skilled nursing services. Care is delivered by appropriately licensed healthcare professionals and tailored to individual needs after discussion and assessment.",
    image: "/assets/services/skilled-nursing-care.jpg",
    whoFor: [
      "Individuals recovering after surgery or hospitalization",
      "People managing chronic conditions at home",
      "Families needing licensed clinical oversight in a home setting",
      "Clients whose care plans include nursing visits or monitoring",
    ],
    mayInclude: [
      "Skilled nursing visits",
      "RN and LPN care",
      "Medication management support",
      "Wound care",
      "Post-surgical support",
      "Chronic condition monitoring",
      "Diabetic education",
      "Cardiovascular care",
      "Colostomy care",
      "Neurological care",
      "Care coordination with the broader care team",
    ],
    howToBegin: [
      "Contact JoyTogether to discuss your needs",
      "Share the type of clinical support you are exploring",
      "Review available nursing options with our care team",
      "Arrange appropriate services based on eligibility and availability",
    ],
    faqs: [
      {
        q: "Is every skilled nursing service available to every patient?",
        a: "No. Available services depend on licensing scope, clinical appropriateness, staffing, and individual circumstances. Our team will discuss what may be suitable after learning more about your needs.",
      },
      {
        q: "Who provides skilled nursing?",
        a: "Skilled nursing is provided by appropriately licensed healthcare professionals, such as RNs and LPNs, according to the authorized plan of care.",
      },
      {
        q: "Does skilled nursing replace a physician?",
        a: "No. Skilled nursing supports care at home and coordinates with physicians and other healthcare professionals. It does not replace medical diagnosis or physician-directed treatment.",
      },
    ],
    disclaimer:
      "Service availability, clinical scope, and licensing details are subject to confirmation. JoyTogether does not guarantee specific clinical outcomes.",
    category: "clinical",
  },
  {
    slug: "hospice-care",
    title: "Hospice Care",
    seoTitle: "Hospice Care in Tampa Bay | JoyTogether Home Care",
    seoDescription:
      "Compassionate hospice support focused on comfort, dignity, family involvement, and quality of life from JoyTogether Home Care.",
    eyebrow: "Hospice Care",
    headline: "Comfort, Dignity, and Compassion Every Step of the Way",
    intro:
      "JoyTogether Home Care is licensed to provide hospice care. Our approach emphasizes comfort, dignity, emotional support, family involvement, and quality of life — with respectful coordination alongside healthcare professionals.",
    image: "/assets/services/home-care-nursing.jpg",
    whoFor: [
      "Individuals seeking comfort-focused end-of-life support",
      "Families who want guidance, presence, and emotional support",
      "Loved ones prioritizing quality of life and dignity at home when appropriate",
    ],
    mayInclude: [
      "Comfort-focused care planning",
      "Emotional and family support",
      "Coordination with healthcare professionals",
      "Individualized support based on needs and goals",
      "Guidance for families navigating next steps",
    ],
    howToBegin: [
      "Reach out to discuss hospice support options",
      "Talk through comfort goals and family priorities",
      "Review available arrangements with our team",
      "Coordinate next steps based on eligibility and circumstances",
    ],
    faqs: [
      {
        q: "Is hospice the same as companion or housekeeping care?",
        a: "No. Hospice care is a distinct, comfort-focused form of support. It is not simply general housekeeping or companion care.",
      },
      {
        q: "Will you publish license numbers on this page?",
        a: "Specific Florida hospice license details, coverage area, and organizational arrangements should be confirmed with management before being published as definitive claims.",
      },
    ],
    disclaimer:
      "Hospice eligibility, coverage, and organizational arrangements require confirmation. This page is informational and not a clinical determination.",
    category: "hospice",
  },
  {
    slug: "private-duty-care",
    title: "Private Duty Care",
    seoTitle: "Private Duty Care — No Insurance? You Still Have Options",
    seoDescription:
      "Explore private-pay home care from JoyTogether Home Care. Personalized support for families who do not have insurance or choose to pay privately.",
    eyebrow: "Private Duty Care",
    headline: "No Insurance? You Still Have Options.",
    intro:
      "JoyTogether Home Care offers private-pay care options for individuals and families seeking compassionate, personalized support without relying on insurance coverage. Insurance eligibility, private-pay pricing, and service availability depend on the selected services and individual circumstances.",
    image: "/assets/services/home-care-private-duty.jpg",
    whoFor: [
      "Families without insurance coverage for home care",
      "Individuals who prefer private-pay arrangements",
      "People seeking flexible companion, personal, or daily living support",
      "Caregivers exploring respite and in-home assistance",
    ],
    mayInclude: [
      "Private-pay home care arrangements",
      "Personalized caregiving discussions",
      "Companion care",
      "Personal care",
      "Assistance with daily activities",
      "Respite and family support",
      "In-home assistance",
      "Flexible scheduling where available",
      "Other authorized nonmedical support services offered by JoyTogether",
    ],
    howToBegin: [
      "Contact JoyTogether or explore Private Duty Care online",
      "Tell us who needs support and what kind of help would be useful",
      "Discuss private-pay options and availability with our care team",
      "Arrange appropriate services based on your goals and circumstances",
    ],
    faqs: [
      {
        q: "Do I need insurance to receive Private Duty Care?",
        a: "No. Private Duty Care is designed for individuals and families who do not have insurance or choose to pay privately. You can explore options without assuming insurance is required.",
      },
      {
        q: "Is private-pay care the same as insurance-covered skilled nursing or hospice?",
        a: "No. Private-pay care should not be confused with insurance-covered skilled nursing or hospice eligibility. Our team can help you understand which path may fit your situation.",
      },
      {
        q: "Can you quote prices online?",
        a: "Specific prices, staffing availability, and scheduling depend on the services requested and current capacity. We discuss those details during a consultation rather than publishing unverified promises.",
      },
    ],
    disclaimer:
      "Private-pay pricing, staffing, and scheduling are confirmed directly with JoyTogether. This page does not guarantee immediate availability.",
    category: "private-duty",
  },
  {
    slug: "personal-care",
    title: "Personal Care",
    seoTitle: "Personal Care Services at Home | JoyTogether",
    seoDescription:
      "Respectful personal care assistance with bathing, dressing, grooming, and daily routines from JoyTogether Home Care.",
    eyebrow: "Nonmedical Support",
    headline: "Respectful Help With Daily Personal Care",
    intro:
      "Personal care support helps individuals stay comfortable, clean, and confident at home with assistance tailored to daily routines and preferences.",
    image: "/assets/service-personal.jpg",
    whoFor: [
      "Seniors who need help with bathing, dressing, or grooming",
      "Adults recovering strength and needing hands-on daily support",
      "Families seeking dignified assistance with personal routines",
    ],
    mayInclude: [
      "Bathing and showering assistance",
      "Dressing and grooming support",
      "Toileting and incontinence assistance",
      "Mobility and transfer help where appropriate",
      "Support maintaining personal comfort and dignity",
    ],
    howToBegin: [
      "Contact JoyTogether",
      "Share the personal care needs you are exploring",
      "Review available support options",
      "Arrange services based on fit and availability",
    ],
    faqs: [
      {
        q: "Is personal care the same as skilled nursing?",
        a: "No. Personal care is nonmedical support with daily living activities. Skilled nursing involves licensed clinical care.",
      },
    ],
    category: "support",
  },
  {
    slug: "companionship",
    title: "Companionship",
    seoTitle: "Companion Care in Tampa Bay | JoyTogether",
    seoDescription:
      "Friendly companion care that supports connection, conversation, and everyday wellbeing at home.",
    eyebrow: "Nonmedical Support",
    headline: "Companionship That Brightens the Day",
    intro:
      "Companion care focuses on meaningful connection — conversation, activities, and presence that help people feel engaged and less alone at home.",
    image: "/assets/service-companion.jpg",
    whoFor: [
      "Individuals who want friendly in-home company",
      "Families concerned about isolation",
      "People who benefit from encouragement with daily activities and outings",
    ],
    mayInclude: [
      "Conversation and social engagement",
      "Shared activities and hobbies",
      "Reading, games, and light recreation",
      "Encouragement with everyday routines",
      "Friendly presence that supports emotional wellbeing",
    ],
    howToBegin: [
      "Reach out to discuss companionship needs",
      "Talk through preferred routines and interests",
      "Review available companion support",
      "Arrange a plan that fits your family",
    ],
    faqs: [
      {
        q: "Does companionship include medical care?",
        a: "Companion care is nonmedical. If clinical needs are present, our team can help you explore skilled nursing or other appropriate options.",
      },
    ],
    category: "support",
  },
  {
    slug: "respite-care",
    title: "Respite Care",
    seoTitle: "Respite Care for Family Caregivers | JoyTogether",
    seoDescription:
      "Temporary in-home respite support so family caregivers can rest and recharge while loved ones receive dependable care.",
    eyebrow: "Family Support",
    headline: "Support for Family Caregivers Who Need a Break",
    intro:
      "Respite care provides temporary support so family caregivers can rest, attend to other responsibilities, and return refreshed — while their loved one receives dependable attention at home.",
    image: "/assets/service-respite.jpg",
    whoFor: [
      "Family caregivers who need short-term relief",
      "Households balancing work and caregiving",
      "Families planning scheduled breaks in care responsibilities",
    ],
    mayInclude: [
      "Temporary in-home caregiver coverage",
      "Companionship and daily living support during respite hours",
      "Help maintaining familiar routines",
      "Flexible arrangements based on availability",
    ],
    howToBegin: [
      "Contact JoyTogether about respite needs",
      "Share preferred timing and support goals",
      "Review available coverage options",
      "Schedule respite support when capacity allows",
    ],
    faqs: [
      {
        q: "Is respite care ongoing or temporary?",
        a: "Respite is typically temporary relief for family caregivers. Ongoing private duty or other services can also be discussed if needed.",
      },
    ],
    category: "support",
  },
  {
    slug: "transportation",
    title: "Transportation & Errands",
    seoTitle: "Errands & Appointment Transportation | JoyTogether",
    seoDescription:
      "Local errands, shopping assistance, and appointment accompaniment from JoyTogether Home Care where available.",
    eyebrow: "Everyday Support",
    headline: "Help Getting Out and Getting Things Done",
    intro:
      "Where available, JoyTogether can help with local errands, shopping assistance, and accompaniment to appointments. Capabilities such as wheelchair-accessible vehicles, medical monitoring during transport, or emergency transportation are not claimed unless separately verified.",
    image: "/assets/services/errands-transport.jpg",
    whoFor: [
      "Individuals who need help with local errands",
      "Clients who benefit from accompaniment to appointments",
      "Families seeking practical day-to-day transportation support",
    ],
    mayInclude: [
      "Grocery and shopping assistance",
      "Prescription pick-up support",
      "Accompanying clients to personal or physician appointments",
      "Local errands that support independence at home",
    ],
    howToBegin: [
      "Tell us what transportation or errand support you need",
      "Confirm local availability with our team",
      "Review practical arrangements and timing",
      "Schedule support based on capacity",
    ],
    faqs: [
      {
        q: "Do you provide emergency or ambulance transportation?",
        a: "No. This service covers practical local accompaniment and errands where available — not emergency medical transport.",
      },
      {
        q: "Are vehicles wheelchair-accessible?",
        a: "Specialized vehicle capabilities should not be assumed. Ask our team what transportation support is currently available for your situation.",
      },
    ],
    disclaimer:
      "Transportation support depends on availability and practical logistics. Specialized medical transport capabilities are not implied.",
    category: "support",
  },
];

export function getServiceLanding(slug: string) {
  return serviceLandings.find((s) => s.slug === slug);
}
