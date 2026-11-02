export type NavItem =
  | { type: "link"; label: string; href: string }
  | {
      type: "group";
      label: string;
      href?: string;
      children: { label: string; href: string }[];
    };

/** Top header — short, grouped */
export const headerNav: NavItem[] = [
  { type: "link", label: "Home", href: "/" },
  {
    type: "group",
    label: "About",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Our Mission", href: "/our-mission" },
    ],
  },
  {
    type: "group",
    label: "Services",
    href: "/services",
    children: [
      { label: "All Services", href: "/services" },
      { label: "Skilled Nursing", href: "/services/skilled-nursing" },
      { label: "Hospice Care", href: "/services/hospice-care" },
      { label: "Private Duty Care", href: "/services/private-duty-care" },
      { label: "Personal Care", href: "/services/personal-care" },
      { label: "Companionship", href: "/services/companionship" },
      { label: "Respite Care", href: "/services/respite-care" },
      { label: "Transportation", href: "/services/transportation" },
      { label: "Home & Companion Care", href: "/home-care-and-companion-care" },
    ],
  },
  {
    type: "group",
    label: "Resources",
    children: [
      { label: "Courses & Training", href: "/training" },
      { label: "Fingerprinting", href: "/fingerprinting" },
      { label: "Careers / Apply", href: "/apply" },
      { label: "Payment Information", href: "/payment-information" },
    ],
  },
  { type: "link", label: "Private Duty", href: "/services/private-duty-care" },
  { type: "link", label: "Contact", href: "/contact" },
];

/** Footer — full flat list */
export const footerNavLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Mission", href: "/our-mission" },
  { label: "Services", href: "/services" },
  { label: "Skilled Nursing", href: "/services/skilled-nursing" },
  { label: "Hospice Care", href: "/services/hospice-care" },
  { label: "Private Duty Care", href: "/services/private-duty-care" },
  { label: "Personal Care", href: "/services/personal-care" },
  { label: "Companionship", href: "/services/companionship" },
  { label: "Respite Care", href: "/services/respite-care" },
  { label: "Transportation", href: "/services/transportation" },
  { label: "Home & Companion Care", href: "/home-care-and-companion-care" },
  { label: "Courses & Training", href: "/training" },
  { label: "Fingerprinting", href: "/fingerprinting" },
  { label: "Careers / Apply", href: "/apply" },
  { label: "Payment Information", href: "/payment-information" },
  { label: "Contact", href: "/contact" },
] as const;
