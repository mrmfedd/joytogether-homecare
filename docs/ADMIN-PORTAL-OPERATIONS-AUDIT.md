# Administrator Portal — Phase 1 System Audit

**Branch:** `feature/admin-portal-operations` (development)  
**Production baseline:** `main` @ Help Center release (`17748d9`)  
**Date:** 2026-11-03

This audit distinguishes **implemented behavior**, **empty data**, and **gaps to build**. It does not assume blank UI means broken backends.

---

## Cross-cutting

| Area | Implemented | Gap |
|------|-------------|-----|
| Auth | NextAuth admin roles (`SUPER_ADMIN`, `ADMIN`, `CARE_COORDINATOR`, `VIEWER`, workforce roles) | Some actions fail silently (`return` without user feedback) |
| Audit | `writeAuditLog` on several lead actions | Not all workforce actions logged consistently |
| PHI | Nonclinical lead/consultation model | Exports must stay marketing/operations scoped |
| Reporting exports | None (charts only on `/admin/reports`) | PDF, CSV, XLSX, print layouts, date filters |
| Empty states | Minimal text (`No leads match…`) | Professional empty states + primary actions |
| Workforce vs CRM reports | Split: `/admin/reports` (leads) vs `/admin/workforce-reports` (KPI cards) | User expects unified **Reports** hub |

---

## Dashboard (`/admin`)

| Existing | Missing |
|----------|---------|
| `getDashboardKpis()` — lead counts, conversion %, by source, job apps, failed notifications | Workforce KPIs (time off, open shifts, corrections) on main dashboard |
| Stat cards link to leads/consultations/private-duty/careers/settings | Cards for pending time off, open shift responses, timesheet corrections |
| DB error state | Copy still says “preview database” on Production |

---

## Leads (`/admin/leads`, `/admin/leads/[id]`)

| Existing | Missing |
|----------|---------|
| List with search, status, service filters | **Create Lead** button / manual create flow |
| Detail: status, assign, activity, follow-up tasks, schedule consultation (if consultation exists) | Edit lead fields (name, email, phone, service) in UI |
| Server actions: status, assign, schedule, follow-up tasks | Archive/close with confirmation; CSV export |
| Website leads via `createLeadFromConsultation` + `/api/consultation` | Contact attempt logging as distinct activity types |
| Permissions: VIEWER sees list without contact | Sort controls (currently created desc only) |

**Empty state cause:** No rows in `Lead` — UI shows weak message, not guided empty state.

---

## Consultations (`/admin/consultations`)

| Existing | Missing |
|----------|---------|
| List (100 recent) with inline `ConsultationUpdateForm` (status, schedule, notes) | **New Consultation** without existing lead |
| Link to lead detail | Create consultation + link to lead; calendar view |
| `scheduleConsultationAction` on lead detail | Resend notifications only when explicitly triggered (keep) |
| | Filters, search, empty state |

**Note:** New website inquiries create `Consultation` with lead automatically; admin-created consultations need explicit action.

---

## Private Duty (`/admin/private-duty`)

| Existing | Missing |
|----------|---------|
| Filtered `listLeads({ privateDutyOnly: true })` | Create private-duty lead; filters/search; export |
| Links to shared lead detail | Convert-to-consultation shortcut (exists on detail if consultation exists) |

---

## Open Shifts (`/admin/open-shifts`)

| Existing | Missing |
|----------|---------|
| Publish offer for unassigned published shifts | Empty state when no shifts/offers |
| List offers; approve pending `ShiftResponse` | Decline response; unpublish/close offer; explain assignment errors to user |
| `publishOpenShiftOfferAction`, `approveShiftResponseTransaction` | Credential/conflict errors swallowed in UI (`catch { return }`) |

---

## Time Off (`/admin/time-off`)

| Existing | Missing |
|----------|---------|
| List requests; approve/deny with note (`reviewTimeOffRequestAction`) | Tabs/filters (pending/approved/denied); empty state |
| Permission `canReviewTimeOff` | Shift conflict preview (if data available) |

---

## Staff Notices (`/admin/notices`)

| Existing | Missing |
|----------|---------|
| Create draft; publish + notify (`createStaffNoticeAction`, `publishStaffNoticeAction`) | Edit draft; schedule publish; archive; acknowledgment tracking UI |
| Priority, ack flag, target all employees | Recipient group selection beyond “all” |

---

## Timesheets (`/admin/timesheets`)

| Existing | Missing |
|----------|---------|
| Employee **clock in/out** (`/employee/time-clock`) — real `TimeEntry` rows | Date range filter; hours worked column; missing clock-out alerts |
| Admin: recent entries + pending `TimesheetCorrection` approve/reject | Timesheet period approval workflow (`Timesheet` model underused in UI) |
| | Export; empty states |

---

## Reports (`/admin/reports`)

| Existing | Missing |
|----------|---------|
| Lead groupBy service + SQL monthly counts; Recharts bar charts | All categories A–G from spec; date range; tables; print/PDF/CSV/XLSX |
| | Empty chart handling when zero rows |

## Workforce Reports (`/admin/workforce-reports`)

| Existing | Missing |
|----------|---------|
| `getWorkforceReportKpis()` stat grid with links | Merge into main Reports or cross-link; printable/exportable detail |

---

## Database

No new tables required for **Phase 2–9 baseline** — models exist: `Lead`, `LeadActivity`, `Consultation`, `FollowUpTask`, `Shift`, `ShiftOffer`, `ShiftResponse`, `EmployeeTimeOffRequest`, `StaffNotice`, `TimeEntry`, `Timesheet`, `TimesheetCorrection`.

Optional future migrations: lead `archivedAt`, notice `scheduledPublishAt`, export job audit fields — **not required for first release**.

---

## Implementation order (feature branch)

1. Shared `AdminEmptyState`, action feedback patterns  
2. Manual lead create + lead export + empty states  
3. Reporting library + unified Reports UI + CSV/XLSX/print  
4. Consultation create + filters  
5. Open shift decline + error surfacing  
6. Notices edit/archive + ack views  
7. Timesheets filters + hours + alerts  
8. Dashboard workforce cards  
9. Help Center article updates  
10. Tests + Preview deploy (no Production until verified)

---

## Out of scope / limitations

- No fabricated Production data  
- No payroll integration (timesheet approval ≠ payroll)  
- No duplicate lead database for private duty  
- Bootstrap super-admin endpoint must **not** reappear on merge/deploy  
