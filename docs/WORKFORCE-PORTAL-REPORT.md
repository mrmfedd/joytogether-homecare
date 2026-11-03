# Workforce portal & scheduling — implementation report

**Branch:** `upgrade/customer-acquisition-redesign`  
**Base commit (admin security):** `e86ebe4`  
**PR #1:** Open — **not merged**  
**Production:** **not migrated or deployed** (Preview Neon only)

## Delivered (Phases 1–11)

| # | Capability | Route(s) | Status |
|---|------------|----------|--------|
| 1 | Employee auth, invite, password reset, MFA, profile | `/employee/login`, `/employee/accept-invite`, `/employee/account` | Implemented |
| 2 | Employee dashboard | `/employee` | Live PostgreSQL KPIs |
| 3 | Admin scheduling | `/admin/scheduling` | Create, publish, cancel, assign, conflict checks |
| 4 | Employee schedule | `/employee/schedule` | Confirm / decline own assignments |
| 5 | Open shifts | `/admin/open-shifts`, `/employee/open-shifts` | Claim + transactional approve |
| 6 | Availability & time off | `/employee/availability`, `/employee/time-off`, `/admin/time-off` | CRUD + approve/deny |
| 7 | Staff notices | `/admin/notices`, `/employee/notices` | Targeting, read/ack, Resend queue (no PHI in email) |
| 8 | Time clock (optional) | `/employee/time-clock`, `/admin/timesheets` | Gated by `workforce.timeClockEnabled` site setting |
| 9 | Employee management | `/admin/employees` | Invite, list, deactivate |
| 10 | Prisma models + migration | `prisma/migrations/20261102190000_workforce` | Ready for **preview** `migrate deploy` only |
| 11 | Workforce reports | `/admin/workforce-reports` | Real aggregates |

## Architecture notes

- **`UserRole.EMPLOYEE`** — portal authorization only; job title stored on **`EmployeeProfile.classification`** (`EmployeeClassification` enum).
- **Admin CRM roles unchanged** — employees cannot access `/admin/*`; staff admins cannot access `/employee/*`.
- **Scheduling conflicts** — overlap checks + approved time off; open-shift approval uses **`prisma.$transaction`** to prevent double-fill.
- **Privacy** — notice emails use generic subjects/bodies; no patient names or clinical data in Resend payloads.

## Database migration (Preview only)

After deploy or locally against **Preview** `DATABASE_URL`:

```bash
npx prisma migrate deploy
npx prisma generate
```

Do **not** run against production without explicit approval.

## Enable time clock (optional module)

Upsert site setting key `workforce.timeClockEnabled` → `true` (via admin Settings or SQL on Preview).

## Testing

| Suite | Notes |
|-------|--------|
| `tests/unit/workforce-shifts.test.ts` | Overlap + eligibility |
| `tests/e2e/employee-portal.spec.ts` | Public employee login smoke |
| Full regression | Re-run `test:unit`, `test:permissions`, Playwright smoke, `/tmp` production build after `prisma generate` |

## Human onboarding

1. **Admin:** `/admin/employees` → invite staff (or `scripts/create-employee-invite.ts`).
2. **Employee:** accept invite → `/employee/login` → optional MFA on `/employee/account`.
3. **Scheduler:** `/admin/scheduling` publish shifts; `/admin/open-shifts` for unfilled coverage.

## Remaining / known gaps

| Item | Severity |
|------|----------|
| Drag-and-drop calendar | **Enhancement** — accessible forms + reassignment selects implemented; DnD not required for MVP |
| Recurring shift UI | **Partial** — `ShiftRecurrence` model exists; admin UI for complex RRULE not built |
| Monthly calendar view | **Enhancement** — weekly/list views implemented first |
| Production Neon + Resend domain | **Launch blocker** (unchanged) |
| Full Playwright matrix (Phase 14) | Expand after Preview migration applied |

## Production readiness

**Preview RC:** Ready after workforce migration on Preview DB + smoke test of employee invite path.  
**Production:** **Not approved** — no production DB migration, no PR merge, no DNS deploy.

**Preview URL:** https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app (updates on push).
