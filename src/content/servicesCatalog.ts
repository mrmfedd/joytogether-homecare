/** Service catalog from joytogetherhomecare.com marketing materials */

export const servicesHeadline =
  "Joy Together Homecare: In-Home Care Services in Tampa, FL";

export const serviceCategories = [
  {
    id: "personal-care-services",
    title: "Personal Care Services",
    image: "/assets/services/services-grid.jpg",
  },
  {
    id: "home-care",
    title: "Home Care",
    image: "/assets/services/home-care-nursing.jpg",
  },
  {
    id: "heartsaver-pediatric",
    title: "Heartsaver® Pediatric",
    image: "/assets/service-companion.jpg",
  },
  {
    id: "errands-transportation",
    title: "Errands & Transportation",
    image: "/assets/services/errands-personal-care.jpg",
  },
  {
    id: "rn-lpn",
    title: "RN / LPN",
    image: "/assets/services/skilled-nursing-care.jpg",
  },
  {
    id: "other-work",
    title: "Other Work",
    image: "/assets/services/home-care-duties.jpg",
  },
] as const;

export const caretakerRequirements = {
  title: "Caretaker requirements & daily support",
  intro:
    "Our caretakers are able to perform work that requires standing, bending, reaching, squatting, kneeling, moving, lifting of patients, and/or equipment up to 50 lbs.",
  items: [
    "Personal vehicle and current car insurance",
    "Meal preparation",
    "Perform light housekeeping",
    "Run errands",
    "Grocery shopping",
    "Laundry and iron",
    "Answer door",
    "Take out garbage",
    "Local transportation",
    "Make the bed",
  ],
  image: "/assets/services/caretaker-requirements.png",
};

export const homeCareDuties = {
  title: "Home care duties",
  image: "/assets/services/home-care-duties.jpg",
  columns: [
    [
      "Light housekeeping",
      "Laundry",
      "Changing the linens",
      "Vacuuming",
      "Dusting",
      "Cleaning the refrigerator",
    ],
    [
      "Transferring and positioning",
      "Toileting",
      "Incontinence",
      "Feeding and special diet",
      "Exercising, ROM, ADL",
      "Ambulation assistance",
    ],
  ],
};

export const skilledNursingServices = {
  title: "Skilled nursing & clinical support",
  image: "/assets/services/skilled-nursing-care.jpg",
  columns: [
    [
      "Wound care",
      "Diabetic teaching",
      "Cardiovascular care",
      "Colostomy care",
      "Oncology care",
      "Post-surgical care",
      "Pulmonary care",
    ],
    [
      "Neurology care",
      "Pain management",
      "Medication management",
      "Alzheimer's / Dementia care",
      "Stroke care",
      "Parkinson's care",
      "Personal care",
    ],
  ],
};

export const otherActivities = {
  title: "Other activities",
  image: "/assets/services/other-activities.png",
  items: [
    "Companionship",
    "Conversation",
    "Playing board games",
    "Reading",
    "Crossword puzzles",
    "Arts and crafts",
    "Cooking together",
    "Watching TV",
    "Mending clothes",
  ],
};

export const companionSupport = {
  title: "Companion & monitoring services",
  image: "/assets/services/companion-support.png",
  items: [
    "Answering the phone",
    "Reading mail",
    "General companion care",
    "Medication reminder",
    "Grooming assistance",
    "Live-in services",
    "Respite care",
    "Monitor client activity",
  ],
};

export const errandsAndPersonal = {
  image: "/assets/services/errands-personal-care.jpg",
  sections: [
    {
      title: "Errands & transportation",
      items: [
        "Grocery and clothes shopping",
        "Picking up prescriptions",
        "Accompanying to physician or personal appointment",
      ],
    },
    {
      title: "Personal care service",
      items: [
        "Medication reminders",
        "Live-in assistance",
        "Companionship",
      ],
    },
  ],
};

export const homeCareNursing = {
  title: "Home care",
  image: "/assets/services/home-care-nursing.jpg",
  intro:
    "JoyTogether Home Care's objectives are to deliver great care by addressing individual patient needs and providing focused, quality care in their place of residence. The nurse position requires an individual with exceptional work standards and ethics. Job responsibilities, skills, and experience include:",
  bullets: [
    "Providing skilled nursing care in the patient's place of residence; previous home care experience preferred.",
    "Critical thinking skills, decisive judgment, and the ability to work independently.",
    "Customer care experience including effective listening and problem-solving skills.",
  ],
};

export const liveTestimonials = [
  {
    quote:
      "In the last few months Stocker have been taking care of my husband. They have been wonderful and very attentive.",
    name: "Kathy",
    role: "Client family",
  },
  {
    quote:
      "It has truly been a blessing to have Martin take such excellent care of my Mom. Thanks",
    name: "Family member",
    role: "Daughter of client",
    featured: true,
  },
  {
    quote:
      "Services have been outstanding — very knowledgeable, kind, and reliable.",
    name: "Rob",
    role: "Client family",
  },
];
