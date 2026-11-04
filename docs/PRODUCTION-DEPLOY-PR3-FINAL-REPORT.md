# PR #3 Production deployment — final delivery report

**Date:** 2026-11-04 (America/New_York)  
**Authorized PR head:** `adeeeaab56c6beed22f1869d45922f361689e7ec` (`adeeeaa`)  
**Merge commit on `main`:** `c8a4007` — *Merge pull request #3: Admin portal operations and reporting*  
**PR:** https://github.com/mrmfedd/joytogether-homecare/pull/3 (**merged** 2026-11-04T06:45:41Z)  
**Live site:** https://www.joytogetherhomecare.com  

**Deployment status:** **COMPLETE** (database migrate + Help seed applied). **Partial verification:** Neon snapshot ID not readable via API; authenticated export/print smoke requires owner MFA session.

---

## Step 1 — Production Neon snapshot (pre-merge backup)

| Check | Result |
|-------|--------|
| Operator attestation | **Fresh manual snapshot** on branch **joytogether-production**, project **`weathered-term-63569834`** |
| Automated list / restore probe | **NOT VERIFIED** — Neon Console OAuth token in `~/.config/neon/credentials.json` returns *supplied credentials do not pass authentication* (access + refresh) |
| Snapshot ID + `created_at` recorded | **MISSING** — add from Neon Console → **Backup & Restore** and keep with this report |

**Rollback reference:** restore the operator snapshot above; Vercel → redeploy previous Production deployment (`17748d9` era).

---

## Step 2 — PR #3 merge gate (reconfirmed)

| Check | Result |
|-------|--------|
| PR state | **MERGED** |
| Merge SHA | **`c8a4007`** |
| GitHub commit status on `c8a4007` | **success** — Vercel: *Deployment has completed* |
| Prior `main` | `17748d9` |

---

## Step 3 — Vercel Production

| Check | Result |
|-------|--------|
| Production deploy on merge commit | **success** (GitHub status API on `c8a4007`) |
| New admin reporting routes live | **yes** — unauthenticated export returns **401** (was **404** pre-merge) |
| `/admin/reports` | **302** → login (expected) |

---

## Step 4 — Production database identity & connection

Verified via `scripts/verify-production-db-readonly.ts` with `JT_PROD_ENV_FILE` (unpooled URL, no secrets logged):

| Field | Value |
|-------|--------|
| Neon project | **`weathered-term-63569834`** |
| Host marker | **`ep-nameless-hall`** (Production) |
| Connection source | `DATABASE_URL_UNPOOLED` |
| Applied migration rows | **8** |

Preview vs Production hosts remain **isolated** (documented in prior QA).

---

## Step 5 — Prisma migration

**Applied on Production (operator run):** `20261103180000_staff_notice_archive`

**Full migration list (8):**

1. `20260330120000_init`
2. `20260330160000_security`
3. `20261102190000_workforce`
4. `20261031120000_help_center`
5. `20261103120000_admin_account_recovery`
6. `20261103130000_user_session_version`
7. `20261103140000_admin_reprovision_invite`
8. `20261103180000_staff_notice_archive`

**Post-migrate verification** (`scripts/verify-production-post-migrate.ts`):

- `StaffNotice.archivedAt` column: **present**
- Help published counts: **25** admin articles, **26** employee articles, **24** Help FAQs

---

## Step 6 — Help Center seed

**Script:** `scripts/seed-production-help-center.ts` (idempotent upsert)  
**Result:** `{"ok":true,"message":"Help Center seed complete (upsert only)."}` (run after migration)

---

## Step 7 — Reporting (7 categories) & exports

**Categories (UI + API):** leads, consultations, private-duty, employees, shifts, time-off, timesheets.

**Unauthenticated Production HTTP** (routes deployed, auth enforced):

| Category × format | HTTP |
|-------------------|------|
| All 7 × csv / xlsx / pdf | **401** each |

**Not verified without SUPER_ADMIN session:** CSV/XLSX/PDF response bodies, Excel MIME types, PDF layout, browser **print** layout (`print:` styles on `/admin/reports`).

---

## Step 8 — Portal, public site, security

**`scripts/production-readonly-smoke.mjs`:** **ok: true** (30 checks)

| Area | Result |
|------|--------|
| Public pages (/, contact, services, apply) | **200** |
| Staff / admin / employee login pages | **200** |
| `/api/health/db` | **connected** |
| `/api/bootstrap-super-admin` | **404** (removed bootstrap stays unavailable) |
| Admin app modules (leads, consultations, calendar, private-duty, open-shifts, time-off, notices, timesheets, reports, help) | **302** to login when unauthenticated |
| Employee app routes | **302** to login when unauthenticated |

**Administrator / employee interactive login:** not exercised in this session (no Production credentials/MFA in agent environment). Login pages and session gates behave as expected.

---

## Step 9 — Unresolved / follow-up

1. **Record Neon snapshot ID and timestamp** in Neon Console (API auth refresh needed for automation: `neonctl auth`).
2. **Owner MFA smoke:** sign in at `/admin/login`, spot-check one export per format and print on `/admin/reports`; repeat a lightweight employee login check if desired.
3. **Credential hygiene:** if Production DB URLs were ever exposed in local logs or chat, **rotate Neon password** and update Vercel Production env + local `production-neon.env` (never commit).

---

## Delivery summary

| Item | Value |
|------|--------|
| Deployed commit | **`c8a4007`** on `main` |
| Feature head merged | **`adeeeaa`** |
| Backup reference | **Operator snapshot on `weathered-term-63569834`** — **ID/time not captured here** |
| Migrations | **8** including **`staff_notice_archive`** |
| Help counts | **25 / 26 / 24** (admin / employee / FAQ) |
| Automated tests this session | DB verify, migration list, readonly HTTP smoke, 21× export **401** matrix |
| Bootstrap endpoint | **404** |

**Verdict:** PR #3 Production rollout **shipped** (merge, Vercel, migrate, Help seed). Treat backup metadata and authenticated reporting QA as the remaining operator items before calling the launch fully signed off.
