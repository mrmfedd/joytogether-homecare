import type { HelpAudience, UserRole } from "@/generated/prisma";
import { buildManualMarkdown, type ManualSection } from "@/lib/help/article-template";

export const HELP_LAST_UPDATED = "2026-10-31";

export type HelpSeedArticle = {
  slug: string;
  title: string;
  summary: string;
  sortOrder: number;
  keywords: string[];
  contextRoutes: string[];
  content: string;
  allowedRoles?: UserRole[];
};

export type HelpSeedCategory = {
  audience: HelpAudience;
  slug: string;
  title: string;
  summary: string;
  sortOrder: number;
  articles: HelpSeedArticle[];
};

export type HelpSeedFaq = {
  audience: HelpAudience;
  question: string;
  answer: string;
  keywords: string[];
  sortOrder: number;
  articleSlug?: string;
};

function mkSection(
  title: string,
  purpose: string,
  who: string,
  steps: string[],
  expectedResult: string,
  extra?: Partial<Pick<ManualSection, "beforeYouBegin" | "notes" | "troubleshooting" | "relatedSlugs">>,
): ManualSection {
  return {
    title,
    purpose,
    who,
    beforeYouBegin: extra?.beforeYouBegin ?? [
      "Sign in to the correct JoyTogether portal with an active account for your role.",
      "Confirm the sidebar lists the feature described in this article.",
      "Keep this Help article open while you complete the steps.",
    ],
    steps,
    expectedResult,
    notes: extra?.notes,
    troubleshooting: extra?.troubleshooting,
    relatedSlugs: extra?.relatedSlugs,
  };
}

function mkArticle(
  meta: Omit<HelpSeedArticle, "content">,
  section: ManualSection,
): HelpSeedArticle {
  return { ...meta, content: buildManualMarkdown(section, HELP_LAST_UPDATED) };
}

const adminCategories: HelpSeedCategory[] = [
  {
    audience: "ADMIN",
    slug: "getting-started",
    title: "Getting started and security",
    summary: "Portal orientation, account security, MFA, and administrator troubleshooting.",
    sortOrder: 1,
    articles: [
    mkArticle(
      {
        slug: "introduction-and-getting-started",
        title: "Introduction and Getting Started",
        summary: "Learn what the Administrator Portal does, which roles can sign in, and how sidebar navigation maps to live CRM and workforce tools.",
        sortOrder: 1,
        keywords: ["admin portal", "roles", "navigation", "terminology"],
        contextRoutes: ["/admin"],
      },
      mkSection(
        "Introduction and Getting Started",
        "The Administrator Portal is the secure workspace where JoyTogether staff manage website inquiries, workforce scheduling, and public content. This guide orients you to supported roles and navigation before you perform operational tasks.",
        "Any user who can access the admin sign-in page: SUPER_ADMIN, ADMIN, CARE_COORDINATOR, CONTENT_EDITOR, RECRUITER, or VIEWER (read-only where permissions allow). Employees use a separate Employee Portal.",
        [
          "Browse to your organization's admin sign-in URL (typically `/admin/login`) and enter the email and password from your invitation.",
          "After authentication, confirm MFA if your role requires it (SUPER_ADMIN and ADMIN accounts must enable MFA before full dashboard access).",
          "Review the left sidebar: Dashboard, Leads, Consultations, Content, and workforce items (Employees, Scheduling, Open Shifts) appear based on your role.",
          "Open **Help Center** from the sidebar to search articles scoped to your permissions; employees cannot see admin-only topics.",
          "Use **Security** under the sidebar (Account) to verify your profile email and MFA status before handling sensitive lead contact details.",
          "Sign out with the sidebar **Sign out** control when finished on a shared workstation."
        ],
        "You can reach every feature your role allows from the sidebar, understand which portal you are in, and know where to find contextual Help on each screen.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          notes: ["VIEWER can open the dashboard and many read-only lists but cannot change records.", "Workforce menu items (Employees through Workforce Reports) appear only for SUPER_ADMIN, ADMIN, and CARE_COORDINATOR."],
          troubleshooting: [{ question: "I sign in but immediately return to the login page.", answer: "Confirm the account is active, the password is correct, and MFA is completed when prompted. Inactive or deactivated users cannot retain a session." }],
          relatedSlugs: ["administrator-account-and-security", "admin-dashboard"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "administrator-account-and-security",
        title: "Administrator Account and Security",
        summary: "Accept invites, set passwords, enable MFA with an authenticator app, and manage account recovery through the Security page.",
        sortOrder: 2,
        keywords: ["MFA", "password", "invite", "security", "account"],
        contextRoutes: ["/admin/account"],
      },
      mkSection(
        "Administrator Account and Security",
        "Protect administrator access with strong passwords and multi-factor authentication (MFA). JoyTogether stores credentials securely and records security-related changes in the audit log.",
        "All administrative users manage their own account on **Security** (`/admin/account`). SUPER_ADMIN additionally invites other administrators from **Admins**.",
        [
          "If you received an email invitation, open the link, choose a strong password, and complete signup before the invite expires.",
          "Sign in at `/admin/login`. SUPER_ADMIN and ADMIN users see an MFA setup gate until authenticator MFA is enabled.",
          "Open **Security** in the sidebar and scan the displayed QR code with an authenticator app (Google Authenticator, 1Password, etc.).",
          "Enter the six-digit code to confirm MFA, then store backup recovery codes offline if the app provides them.",
          "Use **Change password** on the same page to rotate credentials; you must know your current password.",
          "If you forget your password, use **Forgot password** on the login page to receive a reset link by email."
        ],
        "Your account shows MFA enabled, you can sign in with password plus authenticator code, and password changes succeed without locking you out.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          notes: ["MFA enforcement applies to SUPER_ADMIN and ADMIN via the dashboard gate component.", "Never share authenticator codes or invitation links in chat or email threads."],
          troubleshooting: [{ question: "Authenticator codes are rejected.", answer: "Ensure the device clock is accurate. If you replaced your phone, disable and re-enroll MFA from Security while signed in." }],
          relatedSlugs: ["user-management", "administrator-troubleshooting"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "administrator-troubleshooting",
        title: "Administrator Troubleshooting",
        summary: "Resolve common sign-in, MFA, invitation, permission, scheduling, notification, and publishing issues using supported in-app actions.",
        sortOrder: 3,
        keywords: ["troubleshooting", "login", "MFA", "permissions", "notifications"],
        contextRoutes: [],
      },
      mkSection(
        "Administrator Troubleshooting",
        "Use this checklist when an administrator workflow fails unexpectedly. Steps reference only recovery actions built into JoyTogether (no manual database edits).",
        "Any administrative user may follow employee-safe steps; SUPER_ADMIN resolves user invites and role access issues.",
        [
          "Confirm you are on the correct environment URL (preview vs production) and that your account role matches the feature (check sidebar visibility).",
          "For login failures, reset the password via **Forgot password**, then complete MFA if enabled.",
          "If a page redirects to Dashboard, your role lacks permission—CONTENT_EDITOR cannot manage users, and VIEWER cannot save forms.",
          "For scheduling errors, verify the shift is not CANCELED, the employee employment status is ACTIVE, and open-shift credential requirements match stored employee credentials.",
          "When email notifications fail, open **Settings** and review failed notification counts linked from the dashboard KPI card.",
          "For unpublished website changes, confirm the content block or service status is PUBLISHED and not archived.",
          "If workforce actions are missing entirely, confirm your role is SUPER_ADMIN, ADMIN, or CARE_COORDINATOR."
        ],
        "You identify whether the issue is authentication, role permissions, draft/publish state, or notification delivery—and apply the matching in-app fix.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["administrator-account-and-security", "employee-scheduling", "website-and-system-settings"],
        },
      ),
    ),
    ],
  },
  {
    audience: "ADMIN",
    slug: "dashboard-and-operations",
    title: "Dashboard and daily operations",
    summary: "KPI dashboard, daily checklist, and weekly or monthly review routines.",
    sortOrder: 2,
    articles: [
    mkArticle(
      {
        slug: "admin-dashboard",
        title: "Administrator Dashboard",
        summary: "Interpret live KPI cards, inquiry breakdowns, and shortcuts to Leads, Consultations, Private Duty, Careers, and Settings.",
        sortOrder: 1,
        keywords: ["dashboard", "KPI", "metrics", "inquiries"],
        contextRoutes: ["/admin"],
      },
      mkSection(
        "Administrator Dashboard",
        "The dashboard aggregates real counts from PostgreSQL—inquiries, consultations, workforce queues (time off, open shifts, timesheet corrections), job applications, conversion rate, and failed notifications.",
        "All roles that can access `/admin` see KPI cards. The inquiries-by-source panel requires report permission (SUPER_ADMIN, ADMIN, CARE_COORDINATOR).",
        [
          "Open **Dashboard** (`/admin`) after sign-in.",
          "Review **Total inquiries** and **New inquiries**; click a card to jump to the Leads list with filters when a link is provided.",
          "Check **Scheduled consultations** and open **Consultations** to follow up on active intake.",
          "Monitor **Private Duty inquiries** and service-line cards (Skilled Nursing, Hospice, Transportation) for marketing trends.",
          "Open **Job applications** from its KPI when recruiting volume increases.",
          "Review workforce cards: **Pending time off**, **Open shift offers**, **Timesheet corrections**, and **Open time entries** link to the matching admin modules.",
          "Open **Administrative reports** or **Workforce reports** from the dashboard when you need printable summaries.",
          "If you have report access, scroll to **Inquiries by source** to see grouped lead sources.",
          "Click **Failed notifications** (when non-zero) to investigate email delivery in Settings.",
        ],
        "You understand which metrics are clickable, which lists they open, and that numbers reflect live database state rather than samples.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["customer-leads", "consultations", "reports-and-analytics"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "daily-administrator-operations",
        title: "Daily Administrator Operations",
        summary: "A practical morning checklist covering inquiries, staffing confirmations, open shifts, time-off queues, and staff notices.",
        sortOrder: 2,
        keywords: ["daily", "checklist", "operations", "routine"],
        contextRoutes: [],
      },
      mkSection(
        "Daily Administrator Operations",
        "A consistent daily review keeps intake responsive and staffing coverage visible across the workforce tools.",
        "CARE_COORDINATOR and ADMIN roles typically perform this checklist; CONTENT_EDITOR or RECRUITER users focus on their respective modules.",
        [
          "Start on the **Dashboard** and note new inquiries, consultations due, and failed notifications.",
          "Open **Leads**, filter NEW status, assign or update statuses for overnight web submissions.",
          "Review **Consultations** for appointments needing confirmation or follow-up notes.",
          "Workforce admins: open **Scheduling** for the current week and look for shifts awaiting employee confirmation or unpublished drafts.",
          "Process **Open Shifts** pending employee requests before shifts start.",
          "Clear the **Time Off** queue for requests starting within the next few days.",
          "Publish or acknowledge **Notices** if policy updates must reach the field today."
        ],
        "Critical intake and staffing queues are current, and employees see up-to-date schedules and decisions in the Employee Portal.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["admin-dashboard", "employee-scheduling", "open-shifts"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "weekly-and-monthly-operations",
        title: "Weekly and Monthly Operations",
        summary: "Recommended routines for schedule coverage, workforce reports, website accuracy, and outstanding CRM work.",
        sortOrder: 3,
        keywords: ["weekly", "monthly", "review", "reports"],
        contextRoutes: [],
      },
      mkSection(
        "Weekly and Monthly Operations",
        "Longer-cycle reviews complement daily triage by catching coverage gaps, content drift, and analytics trends.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR for workforce and reports; CONTENT_EDITOR for public content; RECRUITER for careers.",
        [
          "Each week, walk forward two weeks in **Scheduling** and fill or publish open shifts before weekends.",
          "Export or review **Workforce Reports** and **Timesheets** for hour anomalies if time clock is enabled.",
          "Monthly, open **Reports** to compare inquiry volume by service interest and month-over-month charts.",
          "CONTENT_EDITOR: audit **Services**, **Service areas**, and **Content** blocks for outdated phone numbers or service descriptions.",
          "RECRUITER: archive filled **Careers** postings and review stale **Job applications**.",
          "SUPER_ADMIN: verify **Settings** business contact data matches marketing materials.",
          "Document unresolved items in lead notes or consultation records rather than external spreadsheets when possible."
        ],
        "Schedules, public website content, and analytics receive periodic review without surprising last-minute coverage gaps.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["reports-and-analytics", "services-and-service-areas", "website-content-management"],
        },
      ),
    ),
    ],
  },
  {
    audience: "ADMIN",
    slug: "users-and-workforce",
    title: "Users, employees, and credentials",
    summary: "Administrator invites, employee roster, and credential rules for open shifts.",
    sortOrder: 3,
    articles: [
    mkArticle(
      {
        slug: "user-management",
        title: "User Management",
        summary: "SUPER_ADMIN invites administrator users, assigns roles, and deactivates access without affecting employee portal accounts.",
        sortOrder: 1,
        keywords: ["SUPER_ADMIN", "invite", "roles", "admin users"],
        contextRoutes: ["/admin/users"],
      allowedRoles: ["SUPER_ADMIN"],
      },
      mkSection(
        "User Management",
        "Administrator accounts are distinct from employee profiles. Only SUPER_ADMIN can invite admins and assign roles such as CARE_COORDINATOR or CONTENT_EDITOR.",
        "SUPER_ADMIN only (`/admin/users`). Other roles do not see the Admins navigation item.",
        [
          "Sign in as SUPER_ADMIN and open **Admins** in the sidebar.",
          "Click **Invite administrator** and enter the person's work email.",
          "Select the appropriate role: ADMIN for general operations, CARE_COORDINATOR for intake and workforce, CONTENT_EDITOR for website copy, RECRUITER for careers, or VIEWER for read-only access.",
          "Send the invitation; the recipient completes signup via the emailed link before expiration.",
          "After they accept, confirm they can sign in and complete MFA if assigned ADMIN or SUPER_ADMIN.",
          "To remove access, deactivate the user record—deactivated admins cannot authenticate.",
          "Use separate **Employees** invitations for caregivers; do not create duplicate admin accounts for field staff."
        ],
        "New administrators receive invites with the correct role, and deactivated users no longer authenticate.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["administrator-account-and-security", "employee-management"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "employee-management",
        title: "Employee Management",
        summary: "Invite employees, track employment status, and deactivate portal access while preserving scheduling history.",
        sortOrder: 2,
        keywords: ["employees", "invite", "deactivate", "roster"],
        contextRoutes: ["/admin/employees"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"],
      },
      mkSection(
        "Employee Management",
        "Workforce administrators maintain the employee roster used by scheduling, open shifts, notices, and the Employee Portal.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR (`/admin/employees`).",
        [
          "Open **Employees** from the workforce section of the sidebar.",
          "Click **Invite employee**, enter their email, and specify job classification metadata shown on the form.",
          "Send the invitation; the employee completes signup at the employee accept-invite link.",
          "After activation, confirm their **Employment status** is ACTIVE for scheduling assignments.",
          "Use employment status changes (for example ON_LEAVE) instead of deleting records when someone pauses work.",
          "Deactivate employees who should no longer sign in; deactivated accounts cannot access `/employee`.",
          "Cross-check **Scheduling** for future assignments before deactivating someone with upcoming shifts."
        ],
        "Invited employees appear in scheduling dropdowns when ACTIVE, and deactivated employees lose portal access immediately.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["employee-scheduling", "administrator-account-and-security"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "employee-credentials-and-open-shifts",
        title: "Employee Credentials and Open Shifts",
        summary: "Understand how credential records affect open-shift eligibility even though no administrator UI yet edits credentials directly.",
        sortOrder: 3,
        keywords: ["credentials", "open shifts", "eligibility", "expiration"],
        contextRoutes: ["/admin/open-shifts"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"],
      },
      mkSection(
        "Employee Credentials and Open Shifts",
        "JoyTogether stores employee credential names and expiration dates in the database. Open shifts can require matching credentials; employees see eligibility on the Open Shifts page. There is currently no admin screen to add or edit credentials—updates require a developer or database migration process.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR who publish open shifts and review requests.",
        [
          "When creating or editing a shift on **Scheduling**, note any credential requirement configured on the shift or open-shift offer.",
          "Publish the shift and, if unassigned, mark it as an open shift offer employees can request.",
          "Employees with matching non-expired credentials see **Request** enabled on `/employee/open-shifts`.",
          "If an employee reports they cannot request a shift, verify their stored credentials (via support/developer tools) match the requirement name and are not expired.",
          "On **Open Shifts**, review pending requests knowing approval assigns the shift atomically to prevent double booking.",
          "Decline requests when credentials or availability conflicts exist and communicate next steps offline.",
          "Plan credential maintenance with your technical team until an in-app editor ships."
        ],
        "You understand why requests are blocked, how matching works at approval time, and that credential data is not yet editable in the admin UI.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          notes: ["Credential matching compares requirement labels to employee credential names and checks expiration dates.", "Do not document PHI in credential names; use license or certification labels only."],
          
          relatedSlugs: ["open-shifts", "employee-scheduling"],
        },
      ),
    ),
    ],
  },
  {
    audience: "ADMIN",
    slug: "scheduling-and-time",
    title: "Scheduling, open shifts, and time off",
    summary: "Draft and publish shifts, manage open shift requests, and review time off.",
    sortOrder: 4,
    articles: [
    mkArticle(
      {
        slug: "employee-scheduling",
        title: "Employee Scheduling",
        summary: "Create draft shifts, publish them, assign employees, handle confirmations, and cancel shifts from the weekly calendar.",
        sortOrder: 1,
        keywords: ["scheduling", "shifts", "publish", "assign"],
        contextRoutes: ["/admin/scheduling"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"],
      },
      mkSection(
        "Employee Scheduling",
        "Scheduling stores shift start/end times, publication status, assignments, and employee confirmation responses used throughout the workforce tools.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR on `/admin/scheduling`.",
        [
          "Open **Scheduling** and use the week navigation controls to select the planning week.",
          "Create a new shift with start time, end time, location or notes fields shown on the form.",
          "Save the shift as a draft while details are still changing.",
          "When ready for employees to see it, publish the shift—only published shifts appear in the Employee Portal schedule.",
          "Assign an ACTIVE employee from the roster dropdown; the assignment may start in pending confirmation until the employee confirms.",
          "Monitor confirmation or decline statuses and reassign if someone declines.",
          "Cancel shifts that will not occur so they no longer appear on employee calendars."
        ],
        "Published shifts show on employee schedules, assignments reflect confirmation state, and canceled shifts are removed from active views.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["open-shifts", "availability-and-time-off", "employee-management"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "open-shifts",
        title: "Open Shifts",
        summary: "Publish unassigned shifts for employee requests, review pending responses, and approve or decline claims without double booking.",
        sortOrder: 2,
        keywords: ["open shifts", "claims", "approve"],
        contextRoutes: ["/admin/open-shifts"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"],
      },
      mkSection(
        "Open Shifts",
        "Open shifts let eligible employees request extra work. Administrators approve one response per shift; the approval transaction prevents two employees receiving the same assignment.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR.",
        [
          "Ensure a shift is published on Scheduling and either unassigned or explicitly offered as open.",
          "Configure credential requirements when the shift demands specific certifications.",
          "Employees submit requests from `/employee/open-shifts`; pending items appear on **Open Shifts**.",
          "Review each pending request for credential match, conflicts, and employment status.",
          "Click **Approve** to assign the employee; the shift leaves the open pool.",
          "Click **Decline** to reject a request so the employee sees the decision in the portal.",
          "Communicate offline if multiple qualified employees requested the same shift."
        ],
        "Approved requests assign the shift once; declined requests clear from the pending queue.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["employee-credentials-and-open-shifts", "employee-scheduling"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "availability-and-time-off",
        title: "Availability and Time Off",
        summary: "Review employee-submitted availability patterns and approve or deny time-off requests that affect scheduling.",
        sortOrder: 3,
        keywords: ["time off", "availability", "PTO"],
        contextRoutes: ["/admin/time-off"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"],
      },
      mkSection(
        "Availability and Time Off",
        "Employees maintain availability in the portal and submit time-off ranges. Administrators decide requests so schedulers know who is reachable.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR.",
        [
          "Open **Time Off** to see pending employee requests sorted by date.",
          "Read the employee notes and date span before deciding.",
          "Approve requests that staffing can cover; the employee portal status becomes APPROVED immediately.",
          "Deny requests with a clear reason when coverage cannot be met.",
          "Cross-check **Scheduling** for conflicting assignments during approved time off.",
          "Ask employees to update **Availability** when their regular hours change long term.",
          "Revisit decisions if an employee withdraws a request before it starts."
        ],
        "Time-off statuses sync to the Employee Portal and inform scheduling decisions.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["employee-scheduling", "daily-administrator-operations"],
        },
      ),
    ),
    ],
  },
  {
    audience: "ADMIN",
    slug: "staff-communications",
    title: "Staff notices",
    summary: "Publish announcements and track employee acknowledgments.",
    sortOrder: 5,
    articles: [
    mkArticle(
      {
        slug: "staff-notices-and-communications",
        title: "Staff Notices and Communications",
        summary: "Create staff notices, target recipients, require acknowledgments, and rely on transactional email where configured.",
        sortOrder: 1,
        keywords: ["notices", "announcements", "acknowledgment"],
        contextRoutes: ["/admin/notices"],
      },
      mkSection(
        "Staff Notices and Communications",
        "Notices broadcast operational updates to employees. Some notices require acknowledgment, which the dashboard tracks as unread counts for each employee.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR.",
        [
          "Open **Notices** and use **New draft notice** to compose an announcement.",
          "Enter a clear title and body without patient identifiers or PHI.",
          "Choose **All active employees** or filter by classification and department.",
          "Enable **Requires acknowledgment** when employees must confirm they read safety or policy updates.",
          "Save the draft, open the notice title to edit, then **Publish & notify** when ready.",
          "Open a published notice to view recipient read/ack timestamps.",
          "Use **Archive notice** when an announcement should leave the active list (Archived tab).",
          "Emails contain workplace text only — never patient health information.",
        ],
        "Published notices appear in the Employee Portal and acknowledgment-required items show on employee dashboards until completed.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["daily-administrator-operations", "viewing-notices-and-announcements"],
        },
      ),
    ),
    ],
  },
  {
    audience: "ADMIN",
    slug: "customer-intake",
    title: "Leads, consultations, and intake",
    summary: "Marketing inquiries, consultation scheduling, private duty, and job applications.",
    sortOrder: 6,
    articles: [
    mkArticle(
      {
        slug: "customer-leads",
        title: "Customer Leads",
        summary: "Work marketing inquiries from the public website—filter, assign, update statuses, and record notes with masked contact fields for limited roles.",
        sortOrder: 1,
        keywords: ["leads", "inquiries", "CRM"],
        contextRoutes: ["/admin/leads"],
      },
      mkSection(
        "Customer Leads",
        "Leads capture families who submit contact forms on the public site. Status tracking and notes help coordinators follow up without using external spreadsheets.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR manage leads. VIEWER may read lists without editing.",
        [
          "Open **Leads** from the sidebar or dashboard KPI links.",
          "Use **Create lead manually** to enter phone or walk-in inquiries with administrator-recorded consent.",
          "Filter by status (for example NEW) to prioritize untouched inquiries.",
          "Download **Export summary CSV** when you need a nonclinical metrics extract (requires report permission).",
          "Open a lead detail page to **Edit lead record**, update status, assign staff, and manage follow-up tasks.",
          "Use **Archive lead** (type ARCHIVE) to close a record when intake is complete.",
          "Download **Export lead detail CSV** from the list when you have report permission (contact fields respect your role).",
          "Use masked contact display appropriately—only roles with contact permission see full phone or email.",
          "Link follow-up actions to **Consultations** when a family moves to scheduled intake."
        ],
        "Lead statuses and notes reflect your team's workflow and feed dashboard conversion metrics.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["consultations", "admin-dashboard"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "consultations",
        title: "Consultations",
        summary: "Track consultation requests, update statuses, assign coordinators, and document follow-up from the consultations workspace.",
        sortOrder: 2,
        keywords: ["consultations", "appointments", "intake"],
        contextRoutes: ["/admin/consultations", "/admin/consultations/calendar"],
      },
      mkSection(
        "Consultations",
        "Consultations represent scheduled or in-progress intake conversations tied to marketing leads. Changes write audit logs for accountability.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR.",
        [
          "Open **Consultations** from the sidebar or dashboard shortcut.",
          "Open **Calendar view** for a month grid of scheduled consultations.",
          "Use **New consultation** to link a consultation to an existing lead and optionally set date, assignee, and notes.",
          "Review the list for appointments needing confirmation or status updates.",
          "Use inline **Save** on each row to reschedule, change status, or add internal notes.",
          "If scheduling fails, read the conflict message — assignees cannot double-book overlapping consultations.",
          "Add internal notes without storing PHI beyond what the family already submitted voluntarily.",
          "Coordinate with **Leads** so marketing status stays aligned after consultations complete.",
          "Retry notifications from **Settings** if families report missing confirmation emails."
        ],
        "Consultation records show current status, notes, and accurate dashboard counts.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["customer-leads", "private-duty-services"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "private-duty-services",
        title: "Private Duty Services",
        summary: "Manage private-duty-specific inquiries separately from skilled nursing or hospice pathways when families request hourly home support.",
        sortOrder: 3,
        keywords: ["private duty", "inquiries"],
        contextRoutes: ["/admin/private-duty"],
      },
      mkSection(
        "Private Duty Services",
        "The Private Duty workspace filters intake oriented toward non-clinical or private-duty care questions, helping coordinators respond with the correct service pathway.",
        "SUPER_ADMIN, ADMIN, and CARE_COORDINATOR.",
        [
          "Open **Private Duty** from the sidebar or the dashboard KPI card.",
          "Use **Add private duty lead** for walk-in private-pay inquiries (stored in the shared Leads database).",
          "Review inquiries whose service text includes Private Duty or private pay.",
          "Update internal status or notes consistent with your private-duty sales process.",
          "Route families to **Consultations** when they are ready for a scheduled conversation.",
          "Ensure public **Services** content describes private duty accurately to reduce misclassified inquiries.",
          "Coordinate with workforce scheduling only after operational intake converts to internal care plans outside this CRM view."
        ],
        "Private duty inquiries are triaged in their own list with statuses visible to your intake team.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["customer-leads", "services-and-service-areas"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "job-applications-and-resumes",
        title: "Job Applications and Resumes",
        summary: "Review careers applications, update statuses, and access resume files stored with secure media rules.",
        sortOrder: 4,
        keywords: ["careers", "applications", "resume"],
        contextRoutes: ["/admin/careers"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECRUITER"],
      },
      mkSection(
        "Job Applications and Resumes",
        "Applicants submit careers forms on the public site. Recruiters track pipeline status and download resumes through authenticated admin routes.",
        "SUPER_ADMIN, ADMIN, and RECRUITER.",
        [
          "Open **Careers** to see job postings and incoming applications.",
          "Filter or sort applications by status to find new submissions.",
          "Open an applicant record to review contact information and role applied for.",
          "Download or preview resume attachments using the secure links provided (private blob storage).",
          "Update application status as candidates progress through your hiring stages.",
          "Archive or mark inactive postings when roles are filled.",
          "Use **Employees** invitations only after a candidate becomes a hired caregiver—not during applicant review."
        ],
        "Application statuses reflect recruiting progress and resume files remain accessible only to authorized staff.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["careers-management", "employee-management"],
        },
      ),
    ),
    ],
  },
  {
    audience: "ADMIN",
    slug: "website-and-content",
    title: "Website content and media",
    summary: "Public content blocks, services, testimonials, careers, and the media library.",
    sortOrder: 7,
    articles: [
    mkArticle(
      {
        slug: "website-content-management",
        title: "Website Content Management",
        summary: "Edit structured page content blocks, FAQs, and publication statuses that power the public marketing site.",
        sortOrder: 1,
        keywords: ["content", "CMS", "FAQ", "publish"],
        contextRoutes: ["/admin/content"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"],
      },
      mkSection(
        "Website Content Management",
        "Content blocks store JSON-backed sections such as homepage hero text. FAQs and other entries respect publication status before appearing publicly.",
        "SUPER_ADMIN, ADMIN, and CONTENT_EDITOR.",
        [
          "Open **Content** to list editable blocks keyed by identifiers like `homepage.hero`.",
          "Select a block to edit title, body fields, and publication status.",
          "Save drafts while copy is in review, then set status to PUBLISHED when ready.",
          "Manage public FAQs from the content tools where implemented, keeping answers nonclinical unless clinically approved.",
          "Preview the public site in a separate tab after publishing to verify rendering.",
          "Coordinate clinical wording with SUPER_ADMIN or ADMIN approvers when a block affects skilled services.",
          "Record major marketing changes in internal notes so future editors understand context."
        ],
        "Published blocks appear on the public website; drafts remain admin-only.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["services-and-service-areas", "media-library"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "services-and-service-areas",
        title: "Services and Service Areas",
        summary: "Maintain service catalog entries, categories, SEO fields, and geographic service areas shown on the public site.",
        sortOrder: 2,
        keywords: ["services", "service areas", "SEO"],
        contextRoutes: ["/admin/services", "/admin/service-areas"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"],
      },
      mkSection(
        "Services and Service Areas",
        "Services define care pathways (including clinical categories) with visibility toggles. Service areas describe communities you serve on marketing pages.",
        "SUPER_ADMIN, ADMIN, and CONTENT_EDITOR.",
        [
          "Open **Services** to view the catalog synced with seeded care service definitions.",
          "Edit descriptions, featured images, and SEO metadata for each service detail page.",
          "Use publication or visibility controls to hide services you are not actively marketing.",
          "Note clinical-locked services where the UI prevents unsafe copy changes without admin approval.",
          "Open **Service areas** to add or edit community names, slugs, and descriptions.",
          "Toggle visibility so only active territories appear on `/service-areas` public routes.",
          "After changes, spot-check the public Services hub for broken links or missing images."
        ],
        "Public visitors see only visible, published services and service areas with accurate descriptions.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["website-content-management", "testimonials-and-reviews"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "testimonials-and-reviews",
        title: "Testimonials and Reviews",
        summary: "Curate testimonial records, manage publication consent fields, and control which quotes appear on the marketing site.",
        sortOrder: 3,
        keywords: ["testimonials", "reviews", "consent"],
        contextRoutes: ["/admin/testimonials"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"],
      },
      mkSection(
        "Testimonials and Reviews",
        "Testimonials store quoted feedback with publication controls so marketing displays only approved, consented content.",
        "SUPER_ADMIN, ADMIN, and CONTENT_EDITOR.",
        [
          "Open **Testimonials** from the sidebar.",
          "Create or edit testimonial entries with attribution text approved by the family.",
          "Record consent or approval flags exactly as your compliance process requires on the form.",
          "Set publication status to hide testimonials undergoing review.",
          "Avoid including PHI—use first names or initials only as directed by policy.",
          "Publish approved testimonials and verify they render on the public testimonials section.",
          "Archive outdated quotes when they no longer reflect current services."
        ],
        "Only approved testimonials with correct publication status appear on the public website.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["website-content-management", "media-library"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "careers-management",
        title: "Careers Management",
        summary: "Publish job listings on the careers page and connect public applicants to the applications workflow.",
        sortOrder: 4,
        keywords: ["careers", "jobs", "hiring"],
        contextRoutes: ["/admin/careers"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECRUITER"],
      },
      mkSection(
        "Careers Management",
        "Careers management keeps public job posts accurate and routes applicants into the admin review queue.",
        "SUPER_ADMIN, ADMIN, and RECRUITER.",
        [
          "Open **Careers** and review active job postings shown on the public careers page.",
          "Create a posting with title, description, and application instructions using the admin form.",
          "Publish openings you are actively hiring for; unpublish or archive closed roles.",
          "Monitor incoming applications linked from each posting.",
          "Coordinate wording with HR so expectations match employment classifications used in employee invites.",
          "Update postings when compensation or schedule details change.",
          "Link successful hires to the **Employees** invitation workflow after onboarding decisions."
        ],
        "Public careers pages list current openings and direct applicants into tracked application records.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["job-applications-and-resumes", "employee-management"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "media-library",
        title: "Media Library",
        summary: "Upload, replace, and remove media assets stored in blob storage with audit logging on changes.",
        sortOrder: 5,
        keywords: ["media", "upload", "images"],
        contextRoutes: ["/admin/media"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"],
      },
      mkSection(
        "Media Library",
        "The media library centralizes images and files reused across services, content blocks, and testimonials. Uploads use authenticated API routes.",
        "SUPER_ADMIN, ADMIN, and CONTENT_EDITOR.",
        [
          "Open **Media** to browse existing assets.",
          "Upload a new file using supported image formats accepted by the upload form.",
          "Add alt text or titles when fields are available for accessibility.",
          "Copy or reference the asset URL when attaching to services or content blocks.",
          "Replace outdated branding by uploading a new file and updating references in Content or Services.",
          "Delete unused assets to keep the library manageable—confirm no live page still references them.",
          "Remember uploads write audit log entries for security review by SUPER_ADMIN."
        ],
        "Assets are stored securely, referenced by admin tools, and public pages show updated imagery after publication.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["website-content-management", "services-and-service-areas"],
        },
      ),
    ),
    ],
  },
  {
    audience: "ADMIN",
    slug: "reports-settings-governance",
    title: "Reports, settings, and governance",
    summary: "Analytics, timesheets, workforce reports, site settings, and security practices.",
    sortOrder: 8,
    articles: [
    mkArticle(
      {
        slug: "reports-and-analytics",
        title: "Reports and Analytics",
        summary: "Category-based administrative reports with date ranges, print layout, and CSV export backed by PostgreSQL metrics.",
        sortOrder: 1,
        keywords: ["reports", "analytics", "timesheets", "workforce"],
        contextRoutes: ["/admin/reports", "/admin/timesheets", "/admin/workforce-reports"],
      },
      mkSection(
        "Reports and Analytics",
        "JoyTogether exposes live SQL-backed analytics—lead, consultation, private duty, employee, shift, time off, and timesheet categories with date-range filters.",
        "CRM reports: SUPER_ADMIN, ADMIN, CARE_COORDINATOR. Workforce reports and timesheets: workforce admin roles.",
        [
          "Open **Reports** and pick a category tab (Leads, Consultations, Private duty, Employees, Shifts, Time off, Timesheets).",
          "Set **From** and **To** dates, then click **Apply range**—metrics count only records in that period (employee metrics ignore dates where noted).",
          "Click **Print report** for a print-friendly layout with company header and generation timestamp.",
          "Click **Download CSV**, **Download Excel**, or **Download PDF** to export the same summary metrics server-side (authorization required).",
          "Open **Workforce Reports** for scheduling KPIs separate from CRM reports.",
          "Open **Timesheets** to filter clock entries, review missing clock-outs, and approve correction requests.",
          "Investigate anomalies by opening underlying Leads, Scheduling, or Open Shifts records.",
        ],
        "You interpret live metrics from PostgreSQL and approve timesheets without relying on external BI tools.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["admin-dashboard", "weekly-and-monthly-operations"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "website-and-system-settings",
        title: "Website and System Settings",
        summary: "Update business contact settings, notification configuration, and workforce toggles accessible to SUPER_ADMIN and ADMIN.",
        sortOrder: 2,
        keywords: ["settings", "contact", "notifications"],
        contextRoutes: ["/admin/settings"],
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      mkSection(
        "Website and System Settings",
        "Site settings store business name, phone, email, service area text, and operational toggles such as time clock enablement. Infrastructure secrets remain in deployment environment variables.",
        "SUPER_ADMIN and ADMIN.",
        [
          "Open **Settings** from the sidebar.",
          "Review business contact fields that feed the public footer and transactional emails.",
          "Update phone or email carefully—changes affect live customer-facing pages after save.",
          "Adjust workforce-related toggles such as time clock enablement when your policy changes.",
          "Monitor failed notification indicators after email provider changes.",
          "Distinguish settings you can edit here from DNS, database, or Vercel configuration handled by developers.",
          "Document who last changed critical settings in your internal change log outside the app if required by policy."
        ],
        "Saved settings persist in PostgreSQL and drive public site contact info plus workforce feature flags.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["admin-dashboard", "reports-and-analytics"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "audit-trails-and-security",
        title: "Audit Trails and Security",
        summary: "Understand server-side audit logging, role-based access control, and secure handling of media and lead data.",
        sortOrder: 3,
        keywords: ["audit", "security", "RBAC"],
        contextRoutes: [],
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      mkSection(
        "Audit Trails and Security",
        "JoyTogether writes audit log rows when administrators change sensitive records (leads, shifts, settings, media). There is not yet a dedicated in-app audit viewer—logs are stored for compliance review via database tools.",
        "SUPER_ADMIN and ADMIN responsible for security governance.",
        [
          "Rely on role-based navigation: if a sidebar item is missing, your role cannot access that module.",
          "Enforce MFA for SUPER_ADMIN and ADMIN accounts through the Security page.",
          "Train staff to avoid exporting lead contact data to personal devices.",
          "Use authenticated media URLs rather than sharing blob keys publicly.",
          "When investigating incidents, ask a developer to query `AuditLog` entries by user and entity type.",
          "Deactivate compromised accounts immediately via Users or Employees pages.",
          "Review Help Center guidance before granting SUPER_ADMIN to new staff."
        ],
        "You understand how actions are logged server-side and how RBAC limits exposure even without a visual audit browser.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["user-management", "administrator-account-and-security"],
        },
      ),
    ),
    ],
  },
];

const employeeCategories: HelpSeedCategory[] = [
  {
    audience: "EMPLOYEE",
    slug: "welcome-and-account",
    title: "Welcome and your account",
    summary: "Invitation, login, passwords, and signing out of the Employee Portal.",
    sortOrder: 1,
    articles: [
    mkArticle(
      {
        slug: "welcome-to-the-employee-portal",
        title: "Welcome to the Employee Portal",
        summary: "Overview of scheduling, open shifts, notices, availability, optional time clock, and where to find Help.",
        sortOrder: 1,
        keywords: ["employee portal", "welcome"],
        contextRoutes: ["/employee"],
      },
      mkSection(
        "Welcome to the Employee Portal",
        "The Employee Portal gives caregivers one place to confirm shifts, request open work, read notices, and manage availability—without access to admin CRM tools or patient charts.",
        "Authenticated employees with ACTIVE or eligible employment status.",
        [
          "Sign in at `/employee/login` using the email from your invitation.",
          "Explore the sidebar or mobile bottom navigation: Dashboard, Schedule, Open Shifts, Availability, Time Off, Notices, Account.",
          "Open **Help Center** for step-by-step manuals scoped to employees only.",
          "Review dashboard cards summarizing pending confirmations, open shifts, notices, and time-off decisions.",
          "Enable MFA optionally under Account for stronger security.",
          "Sign out on shared devices using the sidebar sign-out control.",
          "Contact your coordinator if employment status prevents login."
        ],
        "You know which features exist in the portal and where Help articles live.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["understanding-your-dashboard", "accepting-your-employee-invitation"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "accepting-your-employee-invitation",
        title: "Accepting Your Employee Invitation",
        summary: "Complete the invite link, verify your email, and activate portal access before your first shift.",
        sortOrder: 2,
        keywords: ["invitation", "signup"],
        contextRoutes: [],
      },
      mkSection(
        "Accepting Your Employee Invitation",
        "Workforce administrators send email invitations that link to the employee accept-invite flow where you create a password.",
        "New hires who received an invite email.",
        [
          "Open the invitation email on a trusted device and click the secure link before it expires.",
          "Confirm your email address matches what administrators entered on the Employees page.",
          "Choose a strong password meeting the form requirements.",
          "Submit the signup form and wait for confirmation that your account is active.",
          "Navigate to `/employee/login` and sign in with the new password.",
          "Complete optional MFA enrollment under Account if your organization recommends it.",
          "If the link expired, ask an administrator to resend the invite from Employees."
        ],
        "You can authenticate to the Employee Portal and appear as ACTIVE for scheduling.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["creating-your-account-and-password", "logging-in-and-logging-out"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "creating-your-account-and-password",
        title: "Creating Your Account and Password",
        summary: "Password rules during invite acceptance and best practices for keeping your login secure.",
        sortOrder: 3,
        keywords: ["password", "account creation"],
        contextRoutes: [],
      },
      mkSection(
        "Creating Your Account and Password",
        "Your initial password is set during invitation acceptance. JoyTogether stores passwords hashed—staff cannot read your password.",
        "Employees completing signup or rotating credentials.",
        [
          "During invite acceptance, enter a unique password not reused from personal banking sites.",
          "Avoid sharing passwords with coworkers; each employee must use their own login for auditability.",
          "After first login, open **Account** to verify your display name and email.",
          "Use **Change password** when your organization requires periodic rotation.",
          "Enable MFA if available to protect schedule and notice data if your phone is lost.",
          "Never save passwords in unsecured notes on shared clinic computers.",
          "Contact an administrator if you suspect unauthorized access—they can deactivate and reinvite if needed."
        ],
        "Your account remains personal, secure, and tied to your scheduling history.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["changing-or-resetting-passwords", "updating-account-information"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "logging-in-and-logging-out",
        title: "Logging In and Logging Out",
        summary: "Use the employee login form, optional MFA, and sign out safely on shared devices.",
        sortOrder: 4,
        keywords: ["login", "logout", "session"],
        contextRoutes: [],
      },
      mkSection(
        "Logging In and Logging Out",
        "Sessions protect your schedule and notices. Always sign out when others might use the same browser.",
        "All employees.",
        [
          "Browse to `/employee/login` and enter your work email and password.",
          "If MFA is enabled, enter the six-digit authenticator code when prompted.",
          "On failure, read the error message—inactive accounts cannot sign in.",
          "Use **Forgot password** to email yourself a reset link if needed.",
          "After login, confirm you land on the Dashboard with your name displayed.",
          "Use the sidebar **Sign out** button when finished, especially on shared tablets.",
          "Close the browser tab after sign-out on public networks."
        ],
        "You maintain an active session while working and terminate it cleanly afterward.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["creating-your-account-and-password", "common-problems-and-troubleshooting"],
        },
      ),
    ),
    ],
  },
  {
    audience: "EMPLOYEE",
    slug: "dashboard-and-schedule",
    title: "Dashboard and schedule",
    summary: "Action cards, upcoming shifts, and confirming or declining assignments.",
    sortOrder: 2,
    articles: [
    mkArticle(
      {
        slug: "understanding-your-dashboard",
        title: "Understanding Your Dashboard",
        summary: "Read action cards for pending shift confirmations, open shifts, unread notices, and time-off status.",
        sortOrder: 1,
        keywords: ["dashboard", "stats", "overview"],
        contextRoutes: ["/employee"],
      },
      mkSection(
        "Understanding Your Dashboard",
        "The dashboard summarizes what needs your attention today without opening every module.",
        "Authenticated employees.",
        [
          "Open **Dashboard** (`/employee`) after login.",
          "Review the shift confirmation card and tap through to Schedule if confirmations are pending.",
          "Check the open shifts count and jump to Open Shifts to request extra work.",
          "Note unread notices—required acknowledgments keep the count elevated until completed.",
          "View pending time-off decisions and open the Time Off page for details.",
          "Use linked cards rather than retyping URLs to avoid missing updated counts.",
          "Refresh the page after completing actions elsewhere to see current totals."
        ],
        "You can prioritize confirmations, notices, and requests from one screen.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["viewing-upcoming-shifts", "viewing-notices-and-announcements"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "viewing-upcoming-shifts",
        title: "Viewing Upcoming Shifts",
        summary: "See the next assigned shifts from the dashboard and schedule entry points.",
        sortOrder: 2,
        keywords: ["upcoming", "shifts"],
        contextRoutes: ["/employee/schedule"],
      },
      mkSection(
        "Viewing Upcoming Shifts",
        "Upcoming shifts show published assignments with times and confirmation state.",
        "Employees with published assignments.",
        [
          "From the Dashboard, follow links to **Schedule** when you need detail beyond summary cards.",
          "On Schedule, identify the next chronological assignment starting soonest.",
          "Read start/end times carefully—times display in the portal timezone formatting used by the app.",
          "Note whether each shift awaits confirmation, is confirmed, or was declined.",
          "Use weekly navigation if available to plan beyond the current week.",
          "Return to the dashboard after confirming shifts to update pending counts.",
          "Contact your coordinator if a published shift shows wrong times."
        ],
        "You know when and where you are expected to work next.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["viewing-daily-and-weekly-schedules", "confirming-assigned-shifts"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "viewing-daily-and-weekly-schedules",
        title: "Viewing Daily and Weekly Schedules",
        summary: "Navigate the schedule view for daily and weekly visibility of published assignments.",
        sortOrder: 3,
        keywords: ["schedule", "calendar", "weekly"],
        contextRoutes: ["/employee/schedule"],
      },
      mkSection(
        "Viewing Daily and Weekly Schedules",
        "Schedule lists published shifts assigned to you. Draft or canceled admin shifts never appear here.",
        "All active employees.",
        [
          "Open **Schedule** from the sidebar.",
          "Scan the current week for each day's assignments.",
          "Use navigation controls to move forward or backward across weeks.",
          "Identify shifts still marked pending confirmation—they need your response.",
          "Open shift details if the UI exposes notes or location fields from administrators.",
          "Compare against your personal calendar offline if you maintain one manually.",
          "Report missing assignments to coordinators before the shift start time."
        ],
        "You have a complete picture of published work on your calendar view.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["confirming-assigned-shifts", "declining-shifts-and-consequences"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "confirming-assigned-shifts",
        title: "Confirming Assigned Shifts",
        summary: "Accept assigned shifts so coordinators know you will arrive as scheduled.",
        sortOrder: 4,
        keywords: ["confirm", "assignment"],
        contextRoutes: ["/employee/schedule"],
      },
      mkSection(
        "Confirming Assigned Shifts",
        "Confirmation updates assignment status to CONFIRMED, visible immediately on admin Scheduling.",
        "Employees with pending assignments.",
        [
          "Open **Schedule** and locate shifts flagged as needing confirmation.",
          "Review date, time, and any notes before committing.",
          "Click **Confirm** on the assignment row or detail panel.",
          "Wait for the success state showing CONFIRMED status.",
          "Return to the Dashboard and verify the pending confirmation count decreased.",
          "If you realize an error, contact your coordinator promptly—do not simply skip the shift.",
          "Repeat for each pending assignment so coverage reports stay accurate."
        ],
        "Administrators see CONFIRMED status and can rely on you attending.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["declining-shifts-and-consequences", "understanding-your-dashboard"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "declining-shifts-and-consequences",
        title: "Declining Shifts and Understanding the Consequences",
        summary: "Decline only when necessary; administrators must reassign coverage when you cannot work.",
        sortOrder: 5,
        keywords: ["decline", "shift"],
        contextRoutes: ["/employee/schedule"],
      },
      mkSection(
        "Declining Shifts and Understanding the Consequences",
        "Declining marks the assignment as declined and alerts coordinators to find replacement coverage.",
        "Employees who cannot honor an assigned shift.",
        [
          "Open **Schedule** and select the shift you cannot work.",
          "Use the **Decline** action only after confirming no other resolution exists.",
          "Add optional comments offline through your coordinator if the form lacks a notes field.",
          "Observe the status change to declined on the assignment.",
          "Monitor Open Shifts if you can pick up alternate work later.",
          "Understand that frequent declines may trigger supervisor conversations outside the portal.",
          "Do not decline because of preferences alone when you are still available—confirm instead."
        ],
        "Coordinators see the decline and can reassign the shift before it starts.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["confirming-assigned-shifts", "viewing-and-requesting-open-shifts"],
        },
      ),
    ),
    ],
  },
  {
    audience: "EMPLOYEE",
    slug: "open-shifts",
    title: "Open shifts",
    summary: "Browse published open shifts, submit requests, and track approval status.",
    sortOrder: 3,
    articles: [
    mkArticle(
      {
        slug: "viewing-and-requesting-open-shifts",
        title: "Viewing and Requesting Open Shifts",
        summary: "Browse published open shifts, verify credential eligibility, and submit requests for coordinator approval.",
        sortOrder: 1,
        keywords: ["open shifts", "request"],
        contextRoutes: ["/employee/open-shifts"],
      },
      mkSection(
        "Viewing and Requesting Open Shifts",
        "Open shifts are published offers you may request if credentials and conflicts allow. The page compares shift requirements to credentials stored on your profile.",
        "ACTIVE employees eligible for extra shifts.",
        [
          "Open **Open Shifts** from the sidebar or dashboard card.",
          "Read each offer's time range and any credential requirement label.",
          "If Request is disabled, you may lack a matching non-expired credential or have a scheduling conflict.",
          "Click **Request** on an eligible shift and wait for the pending state confirmation.",
          "Avoid requesting shifts you cannot work if approved—approval assigns you automatically.",
          "Check back later if no offers appear; administrators publish open shifts from Scheduling.",
          "Contact your coordinator if you believe credentials on file are outdated."
        ],
        "Your request enters the admin Open Shifts queue for approval or decline.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["checking-open-shift-request-status", "managing-employee-credentials"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "checking-open-shift-request-status",
        title: "Checking Open Shift Request Status",
        summary: "See whether open shift requests are pending, approved into assignments, or declined.",
        sortOrder: 2,
        keywords: ["open shift", "status", "approval"],
        contextRoutes: ["/employee/open-shifts"],
      },
      mkSection(
        "Checking Open Shift Request Status",
        "After requesting, the Open Shifts page and Schedule reflect whether administrators approved the claim.",
        "Employees who submitted open shift requests.",
        [
          "Return to **Open Shifts** after submitting a request.",
          "Look for pending indicators on the offer you requested.",
          "If approved, verify the shift now appears on **Schedule** as an assignment.",
          "If declined, the offer may reopen for others—read any status messaging shown.",
          "Refresh the dashboard open shift counts after decisions.",
          "Do not request the same shift repeatedly unless the UI allows resubmission.",
          "Follow up offline if a decision is needed urgently before the shift start."
        ],
        "You know whether you are officially assigned or should seek other coverage options.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["viewing-and-requesting-open-shifts", "viewing-daily-and-weekly-schedules"],
        },
      ),
    ),
    ],
  },
  {
    audience: "EMPLOYEE",
    slug: "availability-and-time-off",
    title: "Availability and time off",
    summary: "Set weekly availability patterns and submit time-off requests.",
    sortOrder: 4,
    articles: [
    mkArticle(
      {
        slug: "managing-work-availability",
        title: "Managing Work Availability",
        summary: "Set the weekly availability pattern coordinators reference when building schedules.",
        sortOrder: 1,
        keywords: ["availability", "hours"],
        contextRoutes: ["/employee/availability"],
      },
      mkSection(
        "Managing Work Availability",
        "Availability communicates when you prefer to work. It does not auto-assign shifts but guides administrators.",
        "All employees maintaining schedule preferences.",
        [
          "Open **Availability** from the sidebar.",
          "Review the weekly grid or form fields representing your preferred working windows.",
          "Update days or times when your standing availability changes.",
          "Save the form and wait for confirmation that values persisted.",
          "Update availability before submitting time off for the same dates to avoid confusion.",
          "Remember administrators may still assign outside preferred hours when urgent coverage is needed.",
          "Revisit availability after seasonal schedule changes."
        ],
        "Coordinators see your saved availability when planning published shifts.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["requesting-time-off", "viewing-daily-and-weekly-schedules"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "requesting-time-off",
        title: "Requesting Time Off",
        summary: "Submit date ranges and optional notes for administrator approval.",
        sortOrder: 2,
        keywords: ["time off", "PTO", "request"],
        contextRoutes: ["/employee/time-off"],
      },
      mkSection(
        "Requesting Time Off",
        "Time-off requests create PENDING records until workforce admins approve or deny them.",
        "Employees planning unpaid or PTO time according to company policy.",
        [
          "Open **Time Off** from the sidebar.",
          "Choose start and end dates covering each day you cannot work.",
          "Enter optional notes explaining the request without including patient details.",
          "Submit the form and confirm the new row shows PENDING status.",
          "Watch the dashboard pending card until a decision arrives.",
          "If approved, verify conflicting shifts are reassigned by coordinators.",
          "Submit early for busy holiday periods to aid scheduling."
        ],
        "Administrators receive your request on the admin Time Off page for a decision.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["checking-time-off-approval-status", "managing-work-availability"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "checking-time-off-approval-status",
        title: "Checking Time-Off Approval Status",
        summary: "Track PENDING, APPROVED, and DENIED states on the Time Off page and dashboard.",
        sortOrder: 3,
        keywords: ["time off", "approved", "denied"],
        contextRoutes: ["/employee/time-off"],
      },
      mkSection(
        "Checking Time-Off Approval Status",
        "Statuses update immediately when administrators decide, without requiring a new login.",
        "Employees with submitted time-off requests.",
        [
          "Open **Time Off** to view your historical and active requests.",
          "Locate the request by date range and read its status label.",
          "PENDING means coordinators have not decided—wait or follow up offline if urgent.",
          "APPROVED confirms you are not expected on schedule during those dates.",
          "DENIED means you may still be scheduled—talk with your coordinator about next steps.",
          "Refresh the Dashboard to update pending time-off counts after decisions.",
          "Submit a new request if dates change rather than editing past rows unless the UI allows."
        ],
        "You clearly know whether time off was granted before missing scheduled shifts.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["requesting-time-off", "understanding-your-dashboard"],
        },
      ),
    ),
    ],
  },
  {
    audience: "EMPLOYEE",
    slug: "notices-and-profile",
    title: "Notices and profile",
    summary: "Read notices, acknowledge required items, and update account security.",
    sortOrder: 5,
    articles: [
    mkArticle(
      {
        slug: "viewing-notices-and-announcements",
        title: "Viewing Notices and Announcements",
        summary: "Read staff notices published by administrators and track unread counts on the dashboard.",
        sortOrder: 1,
        keywords: ["notices", "announcements"],
        contextRoutes: ["/employee/notices"],
      },
      mkSection(
        "Viewing Notices and Announcements",
        "Notices communicate policy, safety, or schedule updates. Unread counts appear on your dashboard until you open each notice.",
        "All active employees.",
        [
          "Open **Notices** from the sidebar when the dashboard shows unread items.",
          "Select a notice to read the full body text.",
          "Note whether acknowledgment is required—those notices show additional buttons.",
          "Return to the list and open remaining unread notices to clear counts.",
          "Do not forward notice content containing internal policies to non-employees.",
          "Check notices at the start of each shift day for time-sensitive updates.",
          "Contact an administrator if a notice link or attachment fails to load."
        ],
        "You stay informed and dashboard unread counts drop as you read each notice.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["acknowledging-required-notices", "understanding-your-dashboard"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "acknowledging-required-notices",
        title: "Acknowledging Required Notices",
        summary: "Complete acknowledgment actions for compliance notices that block dashboard clearance.",
        sortOrder: 2,
        keywords: ["acknowledge", "compliance"],
        contextRoutes: ["/employee/notices"],
      },
      mkSection(
        "Acknowledging Required Notices",
        "Required acknowledgments prove you read critical policies. The portal tracks completion per employee.",
        "Employees viewing notices flagged as acknowledgment required.",
        [
          "Open **Notices** and look for badges or buttons indicating required acknowledgment.",
          "Read the entire notice before acknowledging—you are confirming understanding.",
          "Click **Acknowledge** (or equivalent) and wait for confirmation.",
          "Return to the Dashboard and verify unread or pending acknowledgment counts decreased.",
          "If acknowledgment fails, retry on a stable network or contact an administrator.",
          "Do not ask coworkers to acknowledge on your behalf—each login is individual.",
          "Keep offline copies of policy manuals if your organization requires them beyond the portal."
        ],
        "Administrators see acknowledgment completion and your dashboard no longer highlights the notice.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["viewing-notices-and-announcements", "protecting-employee-information"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "managing-employee-credentials",
        title: "Managing Employee Credentials",
        summary: "Learn how credential records affect open shifts even though you cannot edit them in the portal UI.",
        sortOrder: 3,
        keywords: ["credentials", "certifications"],
        contextRoutes: ["/employee/open-shifts"],
      },
      mkSection(
        "Managing Employee Credentials",
        "Credentials (license names and expiration dates) are stored on your employee profile in the database and used to determine open-shift eligibility. There is currently no self-service page to edit them—contact your administrator for updates.",
        "Employees requesting credential-gated open shifts.",
        [
          "Attempt to request an open shift on **Open Shifts** and note if Request is disabled.",
          "Read any messaging about credential requirements on the offer card.",
          "Gather documentation for your current certification or license offline.",
          "Email or call your coordinator to update credential records through internal processes.",
          "After updates, refresh Open Shifts to see if Request becomes available.",
          "Avoid misrepresenting qualifications—approval still validates stored credentials.",
          "Plan renewals early so expirations do not block urgent open shifts."
        ],
        "You understand why eligibility may be blocked and how to get credentials updated outside the UI.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["viewing-and-requesting-open-shifts", "employee-credentials-and-open-shifts"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "updating-account-information",
        title: "Updating Account Information",
        summary: "Review profile details, optional MFA, and contact administrators for email changes.",
        sortOrder: 4,
        keywords: ["account", "profile", "MFA"],
        contextRoutes: ["/employee/account"],
      },
      mkSection(
        "Updating Account Information",
        "The Account page shows your sign-in email and optional MFA enrollment. Some fields may require administrator updates.",
        "All employees.",
        [
          "Open **Account** from the sidebar.",
          "Verify your name and email match HR records.",
          "Use the MFA panel to enroll an authenticator app if you want extra security.",
          "Scan the QR code, enter the verification code, and confirm success messaging.",
          "Use **Change password** to rotate credentials periodically.",
          "Request administrator help if your email address changed jobs—login uses the invited email.",
          "Sign out and back in after major account changes to refresh your session."
        ],
        "Profile and security settings reflect your choices and MFA shows enabled when configured.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["changing-or-resetting-passwords", "logging-in-and-logging-out"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "changing-or-resetting-passwords",
        title: "Changing or Resetting Passwords",
        summary: "Rotate passwords while signed in or recover access via forgot-password email.",
        sortOrder: 5,
        keywords: ["password", "reset"],
        contextRoutes: ["/employee/account"],
      },
      mkSection(
        "Changing or Resetting Passwords",
        "Password changes require knowing the current password unless you use the email reset flow.",
        "Employees maintaining portal access.",
        [
          "While signed in, open **Account** and locate **Change password**.",
          "Enter your current password and a new strong password twice.",
          "Submit and confirm you remain signed in or must reauthenticate.",
          "If locked out, open `/employee/login` and choose **Forgot password**.",
          "Check email for the reset link and choose a new password promptly before expiry.",
          "Update saved passwords in your personal password manager only—not shared documents.",
          "Contact an administrator if reset emails never arrive—your account may be deactivated."
        ],
        "You regain or maintain access without sharing passwords with coordinators.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["updating-account-information", "common-problems-and-troubleshooting"],
        },
      ),
    ),
    ],
  },
  {
    audience: "EMPLOYEE",
    slug: "resources-and-support",
    title: "Resources and support",
    summary: "Notifications, privacy, troubleshooting, checklists, and contacting administrators.",
    sortOrder: 6,
    articles: [
    mkArticle(
      {
        slug: "downloading-calendar-events",
        title: "Downloading Calendar Events Where Supported",
        summary: "Export or manually copy shift times when the portal exposes calendar download links.",
        sortOrder: 1,
        keywords: ["calendar", "export", "ICS"],
        contextRoutes: ["/employee/schedule"],
      },
      mkSection(
        "Downloading Calendar Events Where Supported",
        "JoyTogether focuses on in-portal schedule views. If calendar export links are present on Schedule, use them to add shifts to personal calendar apps—otherwise copy times manually.",
        "Employees wanting personal calendar reminders.",
        [
          "Open **Schedule** and locate any export or 'Add to calendar' control on a shift.",
          "If available, download the ICS or calendar file and open it with your calendar app.",
          "Verify timezone interpretation matches your phone calendar settings.",
          "If no export button exists, manually create calendar events from published shift times.",
          "Update personal entries when administrators change published shift times.",
          "Do not share exported files containing internal location notes publicly.",
          "Return to the portal for authoritative times if personal calendars conflict."
        ],
        "Your personal calendar reflects portal shift times when export is supported or after manual entry.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["viewing-daily-and-weekly-schedules", "understanding-notifications"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "understanding-notifications",
        title: "Understanding Notifications",
        summary: "Email and in-app indicators for schedules, notices, and optional time clock reminders—no GPS or payroll alerts.",
        sortOrder: 2,
        keywords: ["notifications", "email", "time clock"],
        contextRoutes: ["/employee/time-clock", "/employee/notices"],
      },
      mkSection(
        "Understanding Notifications",
        "JoyTogether may send transactional emails for invitations, password resets, and operational events. In-app counts highlight notices and pending actions. Time clock appears only when enabled organization-wide.",
        "All employees.",
        [
          "Watch your work email for invitation and password reset messages from JoyTogether.",
          "Use dashboard cards as in-app notifications for confirmations and notices.",
          "Open **Notices** when unread counts increase—email may not duplicate every notice.",
          "If **Time Clock** is enabled, use it to clock in/out on assigned shifts; if disabled, the page states time clock is unavailable.",
          "Do not expect patient-specific push notifications—clinical records are not in this portal.",
          "Report missing emails to administrators who can check Settings notification health.",
          "Keep mobile email accessible if your organization relies on email for urgent schedule changes."
        ],
        "You know which channels carry schedule updates and that time clock is optional per organization settings.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["viewing-notices-and-announcements", "downloading-calendar-events"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "protecting-employee-information",
        title: "Protecting Employee and Client Information",
        summary: "Handle schedules and notices responsibly without storing PHI on personal devices.",
        sortOrder: 3,
        keywords: ["privacy", "PHI", "security"],
        contextRoutes: [],
      },
      mkSection(
        "Protecting Employee and Client Information",
        "The Employee Portal excludes patient medical records and payroll. Still, schedules and notices may contain sensitive operational details—protect them.",
        "All employees.",
        [
          "Sign out of the portal on shared devices after viewing schedules.",
          "Do not screenshot notices or shifts and post them on social media.",
          "Avoid discussing client identities or health details in portal note fields.",
          "Use MFA on your account when handling notices with policy or compliance content.",
          "Report lost phones with portal access to administrators immediately.",
          "Follow your agency HIPAA training even when this portal does not store clinical charts.",
          "Use official coordinator channels rather than personal texts for coverage changes when policy requires."
        ],
        "You minimize accidental disclosure while using scheduling and notice tools.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["acknowledging-required-notices", "logging-in-and-logging-out"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "common-problems-and-troubleshooting",
        title: "Common Problems and Troubleshooting",
        summary: "Fix login, schedule, open shift, and notice issues using supported employee actions.",
        sortOrder: 4,
        keywords: ["troubleshooting", "help"],
        contextRoutes: [],
      },
      mkSection(
        "Common Problems and Troubleshooting",
        "Resolve typical portal issues without unsupported hacks.",
        "All employees.",
        [
          "If login fails, verify email/password and try **Forgot password** before assuming deactivation.",
          "If Schedule is empty, confirm administrators published shifts and assigned you.",
          "If Open Shifts requests fail, check credential eligibility and conflicting assignments.",
          "If notices will not acknowledge, refresh the page or retry on Wi-Fi.",
          "If Time Clock is missing, your organization may have it disabled—read the page message.",
          "Clear browser cache only after trying sign-out/sign-in to avoid losing in-progress forms.",
          "Escalate to an administrator with screenshots that omit client details if problems persist."
        ],
        "You restore access or understand when coordinator help is required.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["logging-in-and-logging-out", "viewing-and-requesting-open-shifts"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "employee-help-faq-overview",
        title: "Frequently Asked Questions",
        summary: "Quick pointers to Help Center FAQs covering schedules, time off, open shifts, and account security.",
        sortOrder: 5,
        keywords: ["FAQ", "questions"],
        contextRoutes: ["/employee/help"],
      },
      mkSection(
        "Frequently Asked Questions",
        "The Help Center FAQ tab collects short answers synchronized with this manual. Search there first for one-line fixes.",
        "All employees.",
        [
          "Open **Help Center** from the employee sidebar.",
          "Expand the FAQ section beneath category cards.",
          "Use the search bar with keywords like 'open shift' or 'password'.",
          "Follow linked article slugs when an FAQ points to a deeper guide.",
          "Revisit FAQs after app updates—answers reference live JoyTogether behavior.",
          "Ask administrators to request SUPER_ADMIN FAQ edits if you spot outdated answers.",
          "Combine FAQ answers with walkthrough tours available on major pages."
        ],
        "You find concise answers and links to detailed articles without calling support for common tasks.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["common-problems-and-troubleshooting", "how-to-contact-an-administrator"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "daily-employee-checklist",
        title: "Daily Employee Checklist",
        summary: "Start-of-day steps: dashboard, confirmations, notices, and time clock if enabled.",
        sortOrder: 6,
        keywords: ["checklist", "daily"],
        contextRoutes: ["/employee"],
      },
      mkSection(
        "Daily Employee Checklist",
        "A short routine prevents missed confirmations and unread policy notices.",
        "Field employees using the portal daily.",
        [
          "Sign in and open the **Dashboard** each workday morning.",
          "Confirm or decline pending shifts for the next 48 hours.",
          "Read and acknowledge any required **Notices**.",
          "Glance at **Open Shifts** if you want additional hours.",
          "Submit **Time Off** early if you discover a conflict.",
          "Clock in via **Time Clock** only when enabled and you are on site per policy.",
          "Sign out on shared kiosks after completing the checklist."
        ],
        "Coordinators see up-to-date confirmations and acknowledgments before shifts begin.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["understanding-your-dashboard", "confirming-assigned-shifts"],
        },
      ),
    ),
    mkArticle(
      {
        slug: "how-to-contact-an-administrator",
        title: "How to Contact an Administrator",
        summary: "Use official coordinator channels when the portal cannot resolve scheduling or account issues.",
        sortOrder: 7,
        keywords: ["contact", "supervisor", "support"],
        contextRoutes: [],
      },
      mkSection(
        "How to Contact an Administrator",
        "JoyTogether does not replace your agency's on-call phone tree. Use portal data to inform conversations with coordinators.",
        "All employees.",
        [
          "Identify your scheduling coordinator or on-call supervisor from agency materials outside the portal.",
          "Gather specifics before calling: shift date/time, notice title, or error message text.",
          "For account lockouts, ask administrators to verify your employment status and resend invites if needed.",
          "For credential mismatches, request internal credential updates—employees cannot edit credentials in-app.",
          "Use Help Center search to see if a self-service article resolves the issue first.",
          "Avoid sharing passwords or MFA codes with anyone claiming to be support.",
          "Document incident times when reporting portal bugs to SUPER_ADMIN via your agency process."
        ],
        "You escalate with clear context while using official communication paths.",
        {
          beforeYouBegin: ["Sign in to the correct JoyTogether portal with an active account for your role.", "Confirm the left sidebar (or mobile bottom navigation) lists the feature described in this article.", "Keep this Help article open while you complete the steps so you can verify each expected result."],
          
          
          relatedSlugs: ["common-problems-and-troubleshooting", "managing-employee-credentials"],
        },
      ),
    ),
    ],
  },
];

export const helpSeedCategories: HelpSeedCategory[] = [...adminCategories, ...employeeCategories];

export const helpSeedFaqs: HelpSeedFaq[] = [
  {
    audience: "ADMIN",
    question: "Why can't I assign an employee to a shift?",
    answer: "Common causes: the shift is CANCELED or still a draft, the employee is not ACTIVE, or another assignment already exists. Publish the shift first, then choose an ACTIVE employee from the roster dropdown on Scheduling.",
    keywords: ["assign", "shift", "scheduling"],
    sortOrder: 1,
    articleSlug: "employee-scheduling",
  },
  {
    audience: "ADMIN",
    question: "How do I resend an employee invitation?",
    answer: "Open Employees, locate the pending invite, and send a new invitation email from the employee management actions. If the original expired, create a fresh invite with the same work email.",
    keywords: ["invite", "employee", "email"],
    sortOrder: 2,
    articleSlug: "employee-management",
  },
  {
    audience: "ADMIN",
    question: "Why did an open shift request require manual approval?",
    answer: "Open shift responses enter a pending state until an administrator approves or declines them on the Open Shifts page. Approval runs a transaction so only one employee receives the assignment.",
    keywords: ["open shift", "approval"],
    sortOrder: 3,
    articleSlug: "open-shifts",
  },
  {
    audience: "ADMIN",
    question: "Why can't I see the Admins page?",
    answer: "Only SUPER_ADMIN may open /admin/users. Other roles manage their own Security settings but cannot invite administrators.",
    keywords: ["SUPER_ADMIN", "permissions"],
    sortOrder: 4,
    articleSlug: "user-management",
  },
  {
    audience: "ADMIN",
    question: "Why are dashboard notification failures increasing?",
    answer: "Failed transactional emails increment the Failed notifications KPI. Open Settings to review delivery configuration and retry logic—JoyTogether logs failures but does not expose message bodies in Help.",
    keywords: ["notifications", "email", "settings"],
    sortOrder: 5,
    articleSlug: "website-and-system-settings",
  },
  {
    audience: "ADMIN",
    question: "Can VIEWER edit leads?",
    answer: "No. VIEWER may read many lists but lead management actions require SUPER_ADMIN, ADMIN, or CARE_COORDINATOR.",
    keywords: ["VIEWER", "leads", "permissions"],
    sortOrder: 6,
    articleSlug: "customer-leads",
  },
  {
    audience: "ADMIN",
    question: "Where do I edit employee certifications?",
    answer: "There is not yet an administrator UI for credential records. Credentials still affect open-shift eligibility on the employee portal. Contact your technical administrator to update database records until an editor is released.",
    keywords: ["credentials", "certifications"],
    sortOrder: 7,
    articleSlug: "employee-credentials-and-open-shifts",
  },
  {
    audience: "ADMIN",
    question: "How do I unpublish a service from the public website?",
    answer: "Open Services, edit the service, and set visibility or publication status to hide it. Archived clinical services may remain locked for compliance—see the service detail banner.",
    keywords: ["services", "publish", "website"],
    sortOrder: 8,
    articleSlug: "services-and-service-areas",
  },
  {
    audience: "ADMIN",
    question: "Why can't CONTENT_EDITOR access Scheduling?",
    answer: "Workforce navigation is limited to SUPER_ADMIN, ADMIN, and CARE_COORDINATOR. CONTENT_EDITOR should use Content, Media, Services, and Testimonials instead.",
    keywords: ["CONTENT_EDITOR", "scheduling"],
    sortOrder: 9,
    articleSlug: "introduction-and-getting-started",
  },
  {
    audience: "ADMIN",
    question: "How are timesheets approved?",
    answer: "When time clock is enabled, employees clock in/out on assigned shifts. Administrators review entries on Timesheets and approve or adjust before workforce reports reflect the hours.",
    keywords: ["timesheets", "time clock"],
    sortOrder: 10,
    articleSlug: "reports-and-analytics",
  },
  {
    audience: "ADMIN",
    question: "Do consultation updates email the family automatically?",
    answer: "Status changes write audit logs and may trigger configured notifications. Verify the consultation record notes and Settings notification health if families report missing messages.",
    keywords: ["consultations", "email"],
    sortOrder: 11,
    articleSlug: "consultations",
  },
  {
    audience: "ADMIN",
    question: "How do I enable MFA for my ADMIN account?",
    answer: "After login, open Security (/admin/account), scan the QR code with an authenticator app, and confirm the six-digit code. The MFA gate clears once enrollment succeeds.",
    keywords: ["MFA", "security"],
    sortOrder: 12,
    articleSlug: "administrator-account-and-security",
  },
  {
    audience: "EMPLOYEE",
    question: "How do I confirm my next shift?",
    answer: "Open Schedule, locate assignments marked pending confirmation, and click Confirm. The status updates to CONFIRMED and administrators see the change on Scheduling.",
    keywords: ["confirm", "shift", "schedule"],
    sortOrder: 1,
    articleSlug: "confirming-assigned-shifts",
  },
  {
    audience: "EMPLOYEE",
    question: "How do I request a day off?",
    answer: "Go to Time Off, choose start and end dates, add optional notes, and submit. Track PENDING, APPROVED, or DENIED statuses on the same page.",
    keywords: ["time off", "PTO"],
    sortOrder: 2,
    articleSlug: "requesting-time-off",
  },
  {
    audience: "EMPLOYEE",
    question: "Why can't I claim an open shift?",
    answer: "The shift may require credentials you do not have on file, may be expired, may conflict with existing assignments, or may already be filled. Eligible shifts show an active Request button on Open Shifts.",
    keywords: ["open shift", "credentials"],
    sortOrder: 3,
    articleSlug: "viewing-and-requesting-open-shifts",
  },
  {
    audience: "EMPLOYEE",
    question: "How do I change my password?",
    answer: "Open Account, use Change password while signed in, or use Forgot password on the login page if you are locked out.",
    keywords: ["password", "account"],
    sortOrder: 4,
    articleSlug: "changing-or-resetting-passwords",
  },
  {
    audience: "EMPLOYEE",
    question: "How do I know whether my time-off request was approved?",
    answer: "Return to Time Off—the list shows APPROVED or DENIED with reviewer decisions. The dashboard pending card count decreases after approval.",
    keywords: ["time off", "approval"],
    sortOrder: 5,
    articleSlug: "checking-time-off-approval-status",
  },
  {
    audience: "EMPLOYEE",
    question: "Why is Time Clock missing from my menu?",
    answer: "Time clock appears only when your organization enables it in workforce settings. If disabled, the page explains that supervisors must record hours another way.",
    keywords: ["time clock", "hours"],
    sortOrder: 6,
    articleSlug: "understanding-notifications",
  },
  {
    audience: "EMPLOYEE",
    question: "Do I need to acknowledge every notice?",
    answer: "Only notices marked as requiring acknowledgment show an Acknowledge button. Required items stay on your dashboard until completed.",
    keywords: ["notices", "acknowledge"],
    sortOrder: 7,
    articleSlug: "acknowledging-required-notices",
  },
  {
    audience: "EMPLOYEE",
    question: "Can I see patient medical records here?",
    answer: "No. The Employee Portal covers scheduling, notices, availability, and account settings—not clinical patient charts or payroll.",
    keywords: ["privacy", "patient"],
    sortOrder: 8,
    articleSlug: "protecting-employee-information",
  },
  {
    audience: "EMPLOYEE",
    question: "What happens if I decline a shift?",
    answer: "Declining marks the assignment declined so coordinators can reassign coverage. Decline only when you truly cannot work—the action is visible to administrators.",
    keywords: ["decline", "shift"],
    sortOrder: 9,
    articleSlug: "declining-shifts-and-consequences",
  },
  {
    audience: "EMPLOYEE",
    question: "How do I update my availability?",
    answer: "Open Availability, adjust the weekly pattern shown on the form, and save. Coordinators use this when building schedules but it does not auto-assign shifts.",
    keywords: ["availability"],
    sortOrder: 10,
    articleSlug: "managing-work-availability",
  },
  {
    audience: "EMPLOYEE",
    question: "I did not receive my invitation email—what now?",
    answer: "Check spam folders, confirm the email address with your supervisor, and ask an administrator to resend the employee invite from the Employees page.",
    keywords: ["invitation", "email"],
    sortOrder: 11,
    articleSlug: "accepting-your-employee-invitation",
  },
  {
    audience: "EMPLOYEE",
    question: "How do I enable MFA on my employee account?",
    answer: "Open Account and use the MFA setup panel to scan the QR code with an authenticator app, then enter a verification code. MFA is optional for employees but recommended.",
    keywords: ["MFA", "security"],
    sortOrder: 12,
    articleSlug: "updating-account-information",
  }
];
