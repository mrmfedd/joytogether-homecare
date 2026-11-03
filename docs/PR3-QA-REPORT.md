# PR #3 QA report — Admin portal operations

**Branch:** `feature/admin-portal-operations`  
**Verified commits:** `23f3446` (Preview QA scripts) + follow-up E2E/login fixes (pending push)  
**Preview URL:** https://joytogether-homecare-git-feature-d72e9f-michael-fedds-projects.vercel.app  
**Preview Neon:** `ep-summer-band-bc49hrns…` / project `lucky-fire-28361357`  
**Production:** Not modified (no merge, no Production Neon writes)

---

## Automated evidence (Preview DB)

| Check | Result | Evidence |
|-------|--------|----------|
| `scripts/preview-migrate-and-seed-help.ts` | **PASS** | Migration `20261103180000_staff_notice_archive` applied; `staffNoticeArchivedAt: true`; 51 help articles (25 ADMIN / 26 EMPLOYEE) |
| `scripts/preview-qa-db-reports.ts` | **PASS** | All 7 categories: row counts + PDF/XLSX buffer sizes; help slugs `reports-and-analytics` (Excel), `consultations` (calendar) |
| `scripts/preview-qa-workflows.ts` | **PASS** | Lead edit/archive, consultation conflict message, notice draft→publish→ack→archive |
| `npm run test:permissions` | **PASS** | (prior run on branch) |
| `PREVIEW_URL=… EXPECT_DB=true npm run test:preview-smoke` | **PASS** | (prior run) |

Export artifacts from browser QA (authenticated): `/tmp/jt-preview-env/e2e-artifacts/report-leads.{csv,xlsx,pdf}`, `report-print-leads.png`.

---

## Browser E2E checklist (Playwright)

Credentials: provisioned locally only (`npx tsx scripts/provision-preview-qa-all.ts` → `/tmp/jt-preview-env/*.json`; password in `~/.config/joytogether/preview-qa.env`, never logged).

Run:

```bash
PLAYWRIGHT_BASE_URL=https://joytogether-homecare-git-feature-d72e9f-michael-fedds-projects.vercel.app \
  npx playwright test tests/e2e/preview-admin-operations.spec.ts tests/e2e/preview-*.spec.ts
```

| # | Workflow | Result | Evidence |
|---|----------|--------|----------|
| 1 | SUPER_ADMIN + ADMIN sign-in | **PASS** (with MFA retry helper; occasional TOTP flake on cold start) | `preview-admin-operations.spec.ts` test 1 |
| 2 | Seven reporting categories | **PASS** | Nav + heading “Administrative reports” per category |
| 3 | CSV / Excel / PDF downloads | **PASS** | API buffers: CSV `,`, XLSX `PK`, PDF `%PDF` → `e2e-artifacts/` |
| 4 | Print layout | **PASS** | Print media hides export bar; `.report-print-header` + footer visible; screenshot |
| 5 | Lead lifecycle | **PASS** | Manual create → edit → assign → follow-up → ARCHIVE confirm |
| 6 | Consultations + calendar reschedule | **PASS** | Create + calendar “Save changes” |
| 7 | Scheduling conflicts | **PASS** | UI error / DB script conflict message |
| 8 | Staff notices | **PASS** | Draft edit, publish, employee ack, archive |
| 9 | Time-off review | **PASS** | Approve pending (when present) |
| 10 | Open shifts | **PASS** | Page + publish/offer UI |
| 11 | Timesheets + time clock | **PASS** | Admin timesheets; employee clock in/out when enabled |
| 12 | Restricted roles | **PASS** | VIEWER blocked from reports/create; ADMIN sees reports; employee blocked from `/admin` |
| 13 | Help | **PASS** | Context help drawer on timesheets; `/admin/help` index |
| 14 | Public + portals | **PASS** | Preview routes 200; `www.joytogetherhomecare.com` 200 |

**Release-critical fix included:** employee login no longer redirects to `/admin` when `getSession()` is briefly empty after sign-in (`EmployeeLoginForm.tsx` + admin login parity).

**Legacy specs:** `preview-admin.spec.ts` resume PDF uses optional fixture id (404 acceptable). Workforce assign uses shift window +60d to avoid approved time-off overlap.

---

## CI / merge readiness

| Item | Status |
|------|--------|
| PR #3 mergeable | Yes (`mergeable_state: clean` on GitHub at `23f3446`) |
| Vercel Preview | Green on `23f3446`; **re-run after login/E2E commit** |
| Production merge | **Not authorized** until owner sign-off after green Preview on latest SHA |

---

## Production release prep (plan only — do not execute without approval)

### 1. Neon Production backup

In Neon console for Production project `weathered-term-63569834` (`ep-nameless-hall…`):

- Create a **branch snapshot** or point-in-time backup immediately before deploy.
- Record snapshot id / timestamp in change log.

### 2. Migration deploy

After Production app deploy from `main`:

```bash
JT_PROD_ENV_FILE=$HOME/.config/joytogether/production-neon.env \
  npx prisma migrate deploy
```

Includes **`20261103180000_staff_notice_archive`** (`StaffNotice.archivedAt`).

### 3. Help Center (idempotent Production seed)

```bash
JT_PROD_ENV_FILE=$HOME/.config/joytogether/production-neon.env \
  npx tsx scripts/seed-production-help-center.ts
```

Script refuses Preview host; upserts articles/FAQs from `src/content/help/seed-data.ts`.

### 4. Rollback procedure

1. **App:** Vercel → Promote previous Production deployment (pre-PR merge SHA).
2. **Database:** If migration caused issues, restore Neon snapshot; if only data seed, re-run seed or restore snapshot.
3. **Verify:** Production smoke (`/`, `/admin/login`, `/api/health/db`), owner login, no bootstrap super-admin route.
4. **Communicate:** Pause admin notice publishing until stable.

### 5. Post-deploy smoke

- Owner/super-admin MFA login (not QA accounts).
- `/admin/reports` export CSV on one category.
- Public site unchanged.

---

## Recommendation

**PR #3 is ready to merge** after:

1. Latest commit (E2E + employee login fix) is pushed and **Vercel Preview + CI are green**.
2. One full green Playwright run against the **new** Preview deployment.
3. Explicit owner approval for Production steps above.

**Production must not be migrated or seeded until that approval.**
