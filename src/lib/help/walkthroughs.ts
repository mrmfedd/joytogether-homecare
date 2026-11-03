export type WalkthroughStep = {
  id: string;
  title: string;
  body: string;
  selector?: string;
};

export type WalkthroughDefinition = {
  id: string;
  audience: "admin" | "employee";
  title: string;
  steps: WalkthroughStep[];
};

export const ADMIN_WALKTHROUGHS: WalkthroughDefinition[] = [
  {
    id: "admin-first-login",
    audience: "admin",
    title: "First login orientation",
    steps: [
      {
        id: "welcome",
        title: "Welcome",
        body: "Use the left sidebar to reach Leads, Scheduling, and Settings. Help Center articles explain each area.",
        selector: "[data-help-tour='admin-nav']",
      },
      {
        id: "security",
        title: "Secure your account",
        body: "Open Security under the sidebar to enable MFA. SUPER_ADMIN and ADMIN accounts require MFA before full access.",
        selector: "[data-help-tour='admin-security']",
      },
    ],
  },
  {
    id: "admin-dashboard",
    audience: "admin",
    title: "Dashboard orientation",
    steps: [
      {
        id: "kpis",
        title: "KPI cards",
        body: "Each card links to the related workspace. New inquiries and consultations update from live database counts.",
        selector: "[data-help-tour='admin-dashboard-kpis']",
      },
    ],
  },
  {
    id: "admin-invite-employees",
    audience: "admin",
    title: "Inviting employees",
    steps: [
      {
        id: "employees-nav",
        title: "Employees page",
        body: "Workforce admins send email invitations with job classification. The employee completes signup from the link.",
        selector: "[data-help-tour='admin-employees']",
      },
    ],
  },
  {
    id: "admin-scheduling",
    audience: "admin",
    title: "Creating and assigning shifts",
    steps: [
      {
        id: "create",
        title: "Draft shifts",
        body: "Create a draft with start/end times, then Publish. Assign an employee from the roster dropdown.",
        selector: "[data-help-tour='admin-scheduling']",
      },
    ],
  },
  {
    id: "admin-open-shifts",
    audience: "admin",
    title: "Open shift requests",
    steps: [
      {
        id: "review",
        title: "Review claims",
        body: "Published open shifts appear on the employee portal. Approve or decline pending requests here.",
        selector: "[data-help-tour='admin-open-shifts']",
      },
    ],
  },
  {
    id: "admin-time-off",
    audience: "admin",
    title: "Managing time off",
    steps: [
      {
        id: "requests",
        title: "Approve or deny",
        body: "Review employee date ranges and notes. Decisions update the employee portal immediately.",
        selector: "[data-help-tour='admin-time-off']",
      },
    ],
  },
  {
    id: "admin-consultations",
    audience: "admin",
    title: "Reviewing consultations",
    steps: [
      {
        id: "list",
        title: "Consultation list",
        body: "Track status, assignees, and follow-ups from the Consultations page linked from dashboard metrics.",
        selector: "[data-help-tour='admin-consultations']",
      },
    ],
  },
];

export const EMPLOYEE_WALKTHROUGHS: WalkthroughDefinition[] = [
  {
    id: "employee-first-login",
    audience: "employee",
    title: "First login",
    steps: [
      {
        id: "nav",
        title: "Navigation",
        body: "Use Dashboard, Schedule, and Open Shifts from the sidebar (bottom bar on mobile).",
        selector: "[data-help-tour='employee-nav']",
      },
    ],
  },
  {
    id: "employee-dashboard",
    audience: "employee",
    title: "Dashboard orientation",
    steps: [
      {
        id: "stats",
        title: "Action items",
        body: "Cards show shifts needing confirmation, open shifts, unread notices, and pending time off.",
        selector: "[data-help-tour='employee-dashboard']",
      },
    ],
  },
  {
    id: "employee-shifts",
    audience: "employee",
    title: "Finding assigned shifts",
    steps: [
      {
        id: "schedule",
        title: "Schedule page",
        body: "View weekly assignments and confirmation status for each shift.",
        selector: "[data-help-tour='employee-schedule']",
      },
    ],
  },
  {
    id: "employee-confirm",
    audience: "employee",
    title: "Confirming a shift",
    steps: [
      {
        id: "confirm",
        title: "Confirm button",
        body: "Use Confirm on pending assignments. Status changes to CONFIRMED and administrators see the update.",
        selector: "[data-help-tour='employee-schedule']",
      },
    ],
  },
  {
    id: "employee-open-shift",
    audience: "employee",
    title: "Requesting an open shift",
    steps: [
      {
        id: "claim",
        title: "Open Shifts",
        body: "Submit a request on eligible offers. Some shifts require administrator approval or matching credentials.",
        selector: "[data-help-tour='employee-open-shifts']",
      },
    ],
  },
  {
    id: "employee-time-off",
    audience: "employee",
    title: "Submitting time off",
    steps: [
      {
        id: "form",
        title: "Time Off form",
        body: "Choose dates and optional notes. Track PENDING / APPROVED / DENIED on the same page.",
        selector: "[data-help-tour='employee-time-off']",
      },
    ],
  },
  {
    id: "employee-notices",
    audience: "employee",
    title: "Reading notices",
    steps: [
      {
        id: "notices",
        title: "Notices page",
        body: "Open each notice and acknowledge when required. Unread counts appear on your dashboard.",
        selector: "[data-help-tour='employee-notices']",
      },
    ],
  },
];

export function walkthroughStorageKey(id: string) {
  return `joytogether_help_tour_${id}`;
}

export function walkthroughDismissed(id: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(walkthroughStorageKey(id)) === "dismissed";
}

export function dismissWalkthrough(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(walkthroughStorageKey(id), "dismissed");
}

export function resetWalkthrough(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(walkthroughStorageKey(id));
}
