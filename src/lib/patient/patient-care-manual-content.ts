export const PATIENT_CARE_MANUAL_VERSION = "1.0.0";
export const PATIENT_CARE_MANUAL_DATE = "November 2026";

export const administratorManualSections = [
  {
    title: "Registering patients",
    bullets: [
      "Sign in to Admin → Patients → Add Patient.",
      "Patient ID (publicId) is assigned automatically on save.",
      "Mark PHI fields carefully; do not enter real patient data on staging.",
      "Set status, office coordinator, and emergency contact before assignments.",
    ],
  },
  {
    title: "Assigning caregivers",
    bullets: [
      "Open Patients → Patient Assignments or the patient profile quick actions.",
      "Select caregiver, service type, start date, and optional end date.",
      "Ending an assignment revokes employee chart access immediately.",
    ],
  },
  {
    title: "Scheduling patient visits",
    bullets: [
      "Scheduling → New shift → optional Patient visit links a PatientVisit to the shift.",
      "Assigning an employee to a patient-linked shift updates the visit caregiver.",
    ],
  },
  {
    title: "Care notes and review",
    bullets: [
      "Patients → Patient Care Notes lists submitted documentation.",
      "Submitted notes are locked; use addenda for corrections (office reviewers).",
      "Mark notes reviewed after supervisory review.",
    ],
  },
  {
    title: "Messages and alerts",
    bullets: [
      "Admin → Messages for secure threads (patient-related threads link to charts).",
      "Acknowledge urgent threads so caregivers see office acknowledgment.",
      "Patients → Patient Alerts tracks concerns through resolution — reading does not auto-resolve.",
    ],
  },
];

export const caregiverManualSections = [
  {
    title: "My Patients",
    bullets: [
      "Employee portal → My Patients shows only active assignments.",
      "Tap a card for overview, visits, care notes, report concern, and contact office.",
    ],
  },
  {
    title: "Care notes",
    bullets: [
      "Use Add care note on the Care Notes tab.",
      "Save draft before submit; submitted notes cannot be silently edited.",
      "Document within your authorized scope only.",
    ],
  },
  {
    title: "Reporting and messaging",
    bullets: [
      "Report Concern creates a patient alert for the office.",
      "Contact Office opens a secure message thread — not for emergencies (call 911).",
      "Messages shows office replies and urgent acknowledgment status.",
    ],
  },
];