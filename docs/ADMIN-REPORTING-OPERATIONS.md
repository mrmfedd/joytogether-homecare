# Administrative reporting — operations guide

**Location:** https://www.joytogetherhomecare.com/admin/reports (after sign-in)  
**Roles with access:** SUPER_ADMIN, ADMIN, CARE_COORDINATOR (`canViewReports`)

---

## Seven report categories

| # | Category ID | Label |
|---|-------------|--------|
| 1 | `leads` | Leads |
| 2 | `consultations` | Consultations |
| 3 | `private-duty` | Private Duty |
| 4 | `employees` | Employees |
| 5 | `shifts` | Shifts |
| 6 | `time-off` | Time Off |
| 7 | `timesheets` | Timesheets |

Use the category nav on the reports page. Optional **from** / **to** date query parameters filter metrics.

---

## Export and print controls

On each report view (`ReportExportBar`):

| Control | Behavior |
|---------|----------|
| **Print report** | Browser print (`window.print()`); print styles hide nav chrome |
| **Download CSV** | `/api/admin/reports/export?category=…&format=csv` |
| **Download Excel** | `format=xlsx` |
| **Download PDF** | `format=pdf` |

Exports require an **authenticated administrator session** with report permission. Unauthenticated requests return **401** (verified by production smoke, 2026-11-04).

---

## Recommended cadence

### Daily (5–10 minutes)

- **Leads** — new inquiries since yesterday; follow up open items in **Leads** module.
- **Consultations** — today’s scheduled intakes; no-show/cancel patterns.
- **Time off** — pending approvals queue (also on `/admin/time-off`).

### Weekly (30 minutes)

- Run **Shifts** and **Open shifts** reports for coverage gaps.
- **Employees** — headcount/active vs invited pending.
- **Notices** module — acknowledgments overdue (report complements module lists).
- Export **Leads** + **Consultations** CSV for leadership email archive.

### Monthly

- **Private duty** census trends.
- **Timesheets** — if time clock enabled, reconcile hours vs schedule.
- Print or PDF **full dashboard** per category for compliance file.
- Cross-check with Help article *Weekly and monthly review* in `/admin/help`.

---

## Help Center coverage

Seeded admin articles include **Reports and analytics**, **Administrative dashboard**, and **Weekly and monthly review** (search in `/admin/help`). Content reflects CSV/XLSX/PDF/print behavior post–PR #3.

---

## Verification note

This guide describes **implemented** UI and API routes. **Authenticated** download content was not byte-verified in automation; owner acceptance testing covers live behavior.

Do not insert synthetic Production records for reporting tests.
