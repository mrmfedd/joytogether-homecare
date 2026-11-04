# Production acceptance report — PR #3

**Release:** Admin portal operations, reporting, Help Center (PR #3)  
**Acceptance date:** 2026-11-04 (America/New_York)  
**Owner attestation:** Hands-on Production testing completed; functionality accepted as working.  
**Repository:** [mrmfedd/joytogether-homecare](https://github.com/mrmfedd/joytogether-homecare)

---

## Production URLs

| Surface | URL |
|---------|-----|
| Public website | https://www.joytogetherhomecare.com |
| Administrator login | https://www.joytogetherhomecare.com/admin/login |
| Employee (staff) login | https://www.joytogetherhomecare.com/staff-login → `/employee/login` |
| Admin Help Center | https://www.joytogetherhomecare.com/admin/help (after sign-in) |
| Employee Help Center | https://www.joytogetherhomecare.com/employee/help (after sign-in) |

---

## Deployment status (Phase 1)

| Item | Value | Verification source |
|------|--------|---------------------|
| PR #3 | **Merged** (2026-11-04T06:45:41Z) | GitHub API |
| PR #3 merge commit | **`c8a4007`** — application release | GitHub |
| Current `main` HEAD | **`59ec835`** — adds deploy/ops documentation only | GitHub API |
| Vercel Production on `59ec835` | **success** (*Deployment has completed*) | GitHub commit status API |
| Vercel Production on `c8a4007` | **success** | GitHub commit status API |
| Read-only HTTP smoke | **Pass** (`scripts/production-readonly-smoke.mjs`, 30 checks) | Run 2026-11-04 |
| Database health | **connected** (`/api/health/db`) | Same smoke script |

**Rollback references (preserve, do not delete):**

| Deployment | Commit | Use |
|------------|--------|-----|
| Pre–PR #3 Production | **`17748d9`** | Vercel → promote previous Production deployment |
| PR #3 feature merge | **`c8a4007`** | Last known-good **PR #3** application SHA |
| Historical Neon manual snapshot | `main at 2026-11-02 21:29:22 UTC (manual)` | Documented in `docs/PRODUCTION-DB-INIT-REPORT.md` |
| Pre–PR #3 operator snapshot | **Unverified in automation** — see backup runbook | Owner-created snapshot before PR #3 merge (metadata via Neon Console) |

---

## Database (Phase 1)

**Neon project:** `weathered-term-63569834` (`joytogether-production`)  
**Branch (documented):** `main` — `br-tiny-star-bbs3kov4`

**Applied migrations (8):** init, security, workforce, help_center, admin_account_recovery, user_session_version, admin_reprovision_invite, **`staff_notice_archive`**.

**Help Center published counts (Production DB, read-only verify):**

| Audience | Count |
|----------|------:|
| Admin articles | 25 |
| Employee articles | 26 |
| Help FAQs | 24 |

**`StaffNotice.archivedAt`:** present.

---

## Automated tests

| Suite | Status | Notes |
|-------|--------|-------|
| Production readonly smoke | **Executed — pass** | Unauthenticated routes only |
| Playwright PR #3 E2E | **Not re-run on Production** | Last evidence: Preview QA in `docs/PR3-QA-REPORT.md` |
| Unit tests | **Not re-run in this acceptance session** | CI history on PR head applied before merge |

Do not treat Preview E2E as Production proof unless re-run against Production with authorized credentials.

---

## Related documentation (Phase 8)

| Document | Purpose |
|----------|---------|
| `docs/PRODUCTION-DEPLOY-PR3-FINAL-REPORT.md` | Deploy execution record |
| `docs/BACKUP-RECOVERY-RUNBOOK.md` | Neon snapshot / restore |
| `docs/SECURITY-VERIFICATION-CHECKLIST.md` | Security review findings |
| `docs/ADMINISTRATOR-ONBOARDING-GUIDE.md` | Owner ADMIN invite (not sent) |
| `docs/EMPLOYEE-ONBOARDING-GUIDE.md` | Employee + admin training checklists |
| `docs/ROUTINE-MAINTENANCE-CHECKLIST.md` | Ongoing ops |
| `docs/PRODUCTION-CHANGE-MANAGEMENT.md` | How to change Production safely |

---

## Final summary (Phase 9)

1. **Production:** Ready on Vercel; accepted by owner; **`c8a4007`** = PR #3 app release, **`59ec835`** = docs on `main`.
2. **Backup:** Pre–PR #3 snapshot **not verified via API** — operator must record ID/date in Console.
3. **Security:** Code-level review documented; no secret rotation or account changes performed.
4. **Owner onboarding:** **`joytogetherhomecare@gmail.com`** as **ADMIN** — process prepared, **invitation not sent**.
5. **Employee onboarding:** Workflow documented; **no invites sent**.
6. **Reporting:** Seven categories deployed; export routes require auth (401 unauthenticated smoke); print is in-app (`window.print()`).
7. **Documentation:** Updated in this release batch.
8. **Outstanding:** Snapshot metadata; optional authenticated export byte check; Neon CLI re-auth for automation.
9. **Requires owner approval:** Send owner ADMIN invite; create employees; infrastructure/cron changes; any Production data writes.
