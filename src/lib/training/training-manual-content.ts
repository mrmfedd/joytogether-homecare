import { site } from "../../content/site";

export const TRAINING_MANUAL_VERSION = "1.1";
export const TRAINING_MANUAL_DATE = "2026-11-16";

export type ManualChapter = {
  title: string;
  sections: { heading: string; paragraphs?: string[]; bullets?: string[]; numbered?: string[] }[];
};

export const trainingManualChapters: ManualChapter[] = [
  {
    title: "About this manual",
    sections: [
      {
        heading: "Purpose",
        paragraphs: [
          "This manual supports classroom and on-the-job training for JoyTogether Home Care staff who use the Administrator Portal and Employee Portal. It is a print-friendly summary of common workflows, security rules, and checklists.",
          "For the most current step-by-step articles, also use the in-app Help Center after you sign in.",
        ],
      },
      {
        heading: "Portals and public site",
        bullets: [
          `Public website: ${site.url}`,
          `Staff login hub: ${site.url}/staff-login`,
          `Administrator sign-in: ${site.url}/admin/login`,
          `Employee sign-in: ${site.url}/employee/login`,
          `Business contact (public): ${site.contact.email} · ${site.contact.phone}`,
        ],
      },
    ],
  },
  {
    title: "Security and account rules",
    sections: [
      {
        heading: "Everyone",
        bullets: [
          "Accounts are invite-only. There are no shared or default passwords.",
          "Use passwords of at least 12 characters. Do not share credentials.",
          "Enable multi-factor authentication (MFA) when required for your role.",
          "Sign out on shared computers when finished.",
          "Patient-identifying information must not be sent in email or staff notices.",
        ],
      },
      {
        heading: "Activating an employee account",
        numbered: [
          "Receive a one-time activation link from your administrator in person or by phone (not email).",
          "Open the link before it expires (typically within seven days).",
          "Set your own password (12+ characters).",
          "Sign in at the Employee Portal.",
          "Do not forward activation links or paste tokens into chat.",
        ],
      },
      {
        heading: "Password reset",
        bullets: [
          "Use Forgot password on the sign-in page for your portal.",
          "Reset links expire after one hour. Request a new link if needed.",
        ],
      },
    ],
  },
  {
    title: "Administrator roles",
    sections: [
      {
        heading: "Role overview",
        paragraphs: [
          "Permissions control which sidebar items you see and which actions you can take. When in doubt, ask a SUPER_ADMIN before changing another administrator's access.",
        ],
        bullets: [
          "SUPER_ADMIN — Full access, including Admins (invite/deactivate administrators) and Help CMS.",
          "ADMIN — Operations: leads, workforce, content, careers, reports, and business settings.",
          "CARE_COORDINATOR — Leads, consultations, and workforce (similar to ADMIN for care operations).",
          "CONTENT_EDITOR — Website content and services (no workforce admin).",
          "RECRUITER — Careers and job applications.",
          "VIEWER — Read-only access where permitted (no changes).",
        ],
      },
    ],
  },
  {
    title: "Administrator portal — navigation",
    sections: [
      {
        heading: "Main menu (typical ADMIN)",
        bullets: [
          "Dashboard — summary counts and quick links.",
          "Leads — marketing inquiries from the public site.",
          "Consultations — scheduled consultation requests.",
          "Private Duty — private pay client records (non-clinical CRM).",
          "Services / Service areas — published service pages and geography.",
          "Content / Media / Testimonials — website copy and images.",
          "Careers — job postings and applications (resume download in admin).",
          "Employees — profiles, credentials, invitations.",
          "Scheduling — create, assign, publish shifts.",
          "Open Shifts — offer unfilled shifts to eligible staff.",
          "Time Off — review employee requests.",
          "Notices — publish workplace notices (email alert, no PHI).",
          "Timesheets / Workforce Reports — when time clock is enabled.",
          "Reports — business metrics; export CSV, Excel, or PDF.",
          "Help Center — searchable training articles.",
          "Settings — business contact details.",
          "Security — your password and MFA.",
        ],
      },
    ],
  },
  {
    title: "Administrator — daily workflow",
    sections: [
      {
        heading: "Start of shift",
        numbered: [
          "Sign in and complete MFA if prompted.",
          "Open Dashboard and note new leads and consultations.",
          "Review Open Shifts and pending Time Off requests.",
          "Check Notices for items requiring acknowledgment follow-up.",
        ],
      },
      {
        heading: "Leads and consultations",
        bullets: [
          "Respond to new leads within your agency SLA.",
          "Update status as you contact families (Leads / Consultations).",
          "Masked contact fields appear for VIEWER; ADMIN sees full contact.",
        ],
      },
      {
        heading: "Scheduling",
        bullets: [
          "Create shifts as drafts, assign employees, then publish when confirmed.",
          "Use Open Shifts when a published shift has no assignment.",
          "Respect approved time off — the system blocks conflicting assignments.",
        ],
      },
      {
        heading: "Staff notices",
        bullets: [
          "Write clear titles and body text with no patient names or diagnoses.",
          "Publishing sends email with a short excerpt; full text is in the portal.",
          "Require acknowledgment when policy must be confirmed in writing.",
        ],
      },
    ],
  },
  {
    title: "Administrator — invites and employees",
    sections: [
      {
        heading: "Invite a new administrator (SUPER_ADMIN only)",
        numbered: [
          "Open Admins (/admin/users).",
          "Enter email and role (e.g. ADMIN for business owner).",
          "Send invitation and confirm email delivery (check spam).",
          "Re-send if expired — old tokens are invalidated automatically.",
        ],
      },
      {
        heading: "Add a new employee (no email)",
        numbered: [
          "Open Employees (/admin/employees) and enter name, email, classification, optional phone/department.",
          "Click Create employee and copy the one-time activation link from the banner.",
          "Share the link privately — the employee sets their own password.",
          "Confirm status is ACTIVE (not INVITED) before their first published shift.",
          "Point them to Staff Login and Employee Help Center.",
        ],
      },
    ],
  },
  {
    title: "Administrator — reports and records",
    sections: [
      {
        heading: "Reports (/admin/reports)",
        bullets: [
          "Choose a category (leads, consultations, employees, shifts, etc.).",
          "Set the date range, then review charts and summary tables.",
          "Export: Download CSV, Excel, or PDF for leadership meetings.",
          "Use browser Print on the reports page for a quick paper copy.",
          "Exports are confidential operations data — not for clinical filing.",
        ],
      },
      {
        heading: "Job applications",
        bullets: [
          "Applications appear under Careers; resumes stay in secure storage.",
          "Download resume from admin only when authenticated.",
          "Staff receive email notification when someone applies (no resume attached).",
        ],
      },
    ],
  },
  {
    title: "Administrator training checklists",
    sections: [
      {
        heading: "Daily",
        bullets: [
          "Review Leads and Consultations.",
          "Check Open Shifts and Time Off queues.",
          "Scan staff notice due dates.",
        ],
      },
      {
        heading: "Weekly",
        bullets: [
          "Run Reports for the past week; export or print one summary.",
          "Confirm schedule coverage for the next 7–14 days.",
        ],
      },
      {
        heading: "Monthly",
        bullets: [
          "Reconcile timesheets if time clock is in use.",
          "Review private duty census and consultation outcomes.",
          "Audit public content and services for accuracy.",
        ],
      },
    ],
  },
  {
    title: "Employee portal",
    sections: [
      {
        heading: "Navigation",
        bullets: [
          "Dashboard — upcoming shifts and action items.",
          "Schedule — view and confirm or decline assigned shifts.",
          "Open Shifts — request open shifts you qualify for.",
          "Availability — set when you can work.",
          "Time Off — submit requests (admin approves).",
          "Notices — read and acknowledge workplace messages.",
          "Time Clock — clock in/out when enabled by your organization.",
          "Help — employee training articles and FAQs.",
          "Profile — password and MFA.",
        ],
      },
      {
        heading: "Employee responsibilities",
        bullets: [
          "Confirm or decline assigned shifts promptly.",
          "Check Notices weekly; acknowledge when required.",
          "Submit time-off early; do not request shifts when on approved leave.",
          "Use the portal instead of email for schedule and policy updates.",
          "Call the office for emergencies; the portal is not for urgent clinical triage.",
        ],
      },
    ],
  },
  {
    title: "Employee onboarding checklist",
    sections: [
      {
        heading: "Before first shift",
        numbered: [
          "Accept invitation within 48 hours and set password.",
          "Sign in at Employee login; enable MFA if offered.",
          "Open Schedule and Notices; confirm you see assigned shifts.",
          "Read Help articles on schedule confirmation and time off.",
          "Save agency phone number from the public site or Help.",
        ],
      },
      {
        heading: "Ongoing",
        bullets: [
          "Check schedule and notices at least weekly.",
          "Keep availability current when your hours change.",
          "Never share login credentials or patient information in email.",
        ],
      },
    ],
  },
  {
    title: "In-app Help and updates",
    sections: [
      {
        heading: "Help Center",
        bullets: [
          "Administrators: /admin/help — search by topic; articles match sidebar features.",
          "Employees: /employee/help — workforce and portal guidance.",
          "SUPER_ADMIN can manage Help articles at /admin/help/manage.",
        ],
      },
      {
        heading: "Print full admin articles from the browser",
        paragraphs: [
          "Administrators who are signed in may open /admin/help/print to print or Save as PDF from the browser for a complete export of published Help articles.",
        ],
      },
      {
        heading: "Updating this PDF",
        paragraphs: [
          "Technical staff regenerate this file from the project with: npm run generate:training-manual",
          "Output path: public/downloads/joytogether-staff-portal-training-manual.pdf",
        ],
      },
    ],
  },
];