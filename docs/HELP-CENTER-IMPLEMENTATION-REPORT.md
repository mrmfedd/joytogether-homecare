# Help Center implementation report

**Branch:** `feature/in-app-user-manual`  
**Application version:** 0.1.0  
**Content last reviewed:** 2026-10-31  

## Delivered routes

| Route | Purpose |
|-------|---------|
| `/admin/help` | Administrator Help home, search, FAQs, walkthroughs |
| `/admin/help/[slug]` | Administrator article |
| `/admin/help/print` | Printable / PDF manual (browser print) |
| `/admin/help/manage` | SUPER_ADMIN article list, publish toggles, stale review |
| `/admin/help/manage/new` | Create article |
| `/admin/help/manage/[id]` | Edit article + revision history |
| `/employee/help` | Employee Help home |
| `/employee/help/[slug]` | Employee article |
| `/employee/help/print` | Employee printable manual |

## Database

- Models: `HelpCategory`, `HelpArticle`, `HelpArticleRevision`, `HelpFaq`
- Migration: `20261031120000_help_center`

## Seed content

- **Admin:** 8 categories, **25** articles (all spec chapters covered)
- **Employee:** 6 categories, **26** articles
- **FAQs:** 12 administrator + 12 employee entries in `helpSeedFaqs`
- Seed entrypoint: `prisma/seed-help.ts` (called from `prisma/seed.ts`)

## Article slugs (admin)

`introduction-and-getting-started`, `administrator-account-and-security`, `administrator-troubleshooting`, `admin-dashboard`, `daily-administrator-operations`, `weekly-and-monthly-operations`, `user-management`, `employee-management`, `employee-credentials-and-open-shifts`, `employee-scheduling`, `open-shifts`, `availability-and-time-off`, `staff-notices-and-communications`, `customer-leads`, `consultations`, `private-duty-services`, `job-applications-and-resumes`, `website-content-management`, `services-and-service-areas`, `testimonials-and-reviews`, `careers-management`, `media-library`, `reports-and-analytics`, `website-and-system-settings`, `audit-trails-and-security`

## Article slugs (employee)

`welcome-to-the-employee-portal`, `accepting-your-employee-invitation`, `creating-your-account-and-password`, `logging-in-and-logging-out`, `understanding-your-dashboard`, `viewing-upcoming-shifts`, `viewing-daily-and-weekly-schedules`, `confirming-assigned-shifts`, `declining-shifts-and-consequences`, `viewing-and-requesting-open-shifts`, `checking-open-shift-request-status`, `managing-work-availability`, `requesting-time-off`, `checking-time-off-approval-status`, `viewing-notices-and-announcements`, `acknowledging-required-notices`, `managing-employee-credentials`, `updating-account-information`, `changing-or-resetting-passwords`, `downloading-calendar-events`, `understanding-notifications`, `protecting-employee-information`, `common-problems-and-troubleshooting`, `employee-help-faq-overview`, `daily-employee-checklist`, `how-to-contact-an-administrator`

## UI features

- Search (server action, role-filtered)
- Sidebar topic navigation + category cards
- Breadcrumbs, related articles, back-to-top, TOC for long articles
- Contextual Help drawer (`ContextHelpButton`, `HelpPageHeader` on key admin pages)
- Interactive walkthroughs (localStorage dismiss / restart)
- SUPER_ADMIN Markdown CMS with revision history
- Mobile-friendly layouts; employee bottom nav includes Help

## Tests

- `tests/unit/help-center.test.ts` — access control, search scoring, context routes, seed counts, walkthrough keys

## Known limitations

- **Screenshots:** Articles are text-first; add sanitized screenshots via CMS when available.
- **Employee credential admin UI:** Database supports credentials and open-shift matching, but there is no full credential CRUD screen on `/admin/employees` yet—documented honestly in help content.
- **Calendar ICS export:** Documented as optional; depends on future UI controls on Schedule.
- **PDF:** Browser print only (no generated PDF binary on server).
- **Walkthroughs:** Lightweight overlays; they do not highlight DOM targets with a spotlight library yet (`selector` fields reserved for future enhancement).

## Post-merge checklist

1. Merge PR after CI + Preview review (do not skip production review).
2. Run production migration when approved (`RUN_PRODUCTION_MIGRATIONS` policy per existing Vercel scripts).
3. Run `db:seed` on preview/production once to load help content if not seeded automatically.
4. SUPER_ADMIN spot-check CMS publish/unpublish on Preview.
