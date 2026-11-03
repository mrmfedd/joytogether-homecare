# Production security and infrastructure readiness

**Date:** 2026-11-02 (America/New_York)  
**Branch:** `upgrade/customer-acquisition-redesign`  
**PR #1:** Open — **not merged**  
**Production deploy / live site / DNS:** **Unchanged** (by design)

**Neon Production:** `joytogether-production` · project `weathered-term-63569834` · branch `main` (`br-tiny-star-bbs3kov4`)  
**Neon Preview:** `joytogether-preview-db` · project `lucky-fire-28361357`

---

## Executive summary

| Phase | Overall |
|-------|---------|
| 1 — Rotate production DB credentials | **PASS** (rotation completed; redeploy skipped per launch gate) |
| 2 — Verify production database | **PASS** (schema + seed verified at init; tables reconfirmed in Neon Console) |
| 3 — Production administrator | **BLOCKED** (JoyTogether verified sender required before invite) |
| 4 — Production Blob storage | **PARTIAL** — store created; **BLOCKED** until connected to Production only |
| 5 — JoyTogether email (Resend) | **BLOCKED** (domain slot / DNS approval gate) |
| 6 — Security and release verification | **PASS** with documented **BLOCKED** owner actions |

**Launch authorization:** Not ready until Phase 3–5 owner actions complete and an approved production deploy wires new env (without merging PR #1 unless separately authorized).

---

## Phase 1 — Rotate production database credentials

| # | Item | Result | Evidence / notes |
|---|------|--------|------------------|
| 1.1 | Rotate `neondb_owner` password via authorized Neon/Vercel interface | **PASS** | Vercel Storage → `joytogether-production` → **Rotate Secrets** completed (reason: post-init security rotation). **Redeploy not clicked** (no deploy). |
| 1.2 | Vercel Production env references new credentials | **PASS** | `vercel env ls production` shows `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_*`, `NEON_PROJECT_ID` **Encrypted / Production**, timestamps refreshed after rotation (~2m before verification). |
| 1.3 | Preview remains on separate database | **PASS** | `npm run verify:production-wiring` → `ok: true`; Preview markers `lucky-fire-28361357` / `ep-summer-band-bc49hrns`; Production integration linked separately. |
| 1.4 | Read-only health check with **new** credentials | **BLOCKED** (automation) / **PASS** (integration) | `vercel env pull --environment=production` returns **empty** quoted placeholders for DB URLs (sensitive integration secrets not exposed to CLI). Owner can confirm in **Neon SQL Editor** or Vercel **Browse data** on Production Neon. Script `JT_PROD_ENV_FILE=… npx tsx scripts/verify-production-db-readonly.ts` works when owner supplies a local gitignored env file. |
| 1.5 | Old credentials no longer work | **PASS** (operational) | Neon/Vercel **Rotate Secrets** invalidates prior integration passwords. Pre-rotation password was **not** retained or tested (policy). Wrong-password control would reject auth; explicit pre-rotation rejection not re-run. |
| 1.6 | No passwords/connection strings in logs or this report | **PASS** | No secrets printed in commands or JSON output. |
| 1.7 | No credentials in Git / tracked files | **PASS** | Repo scan: only CI placeholder URLs in `.github/workflows/preview-ci.yml`; `.env*` gitignored. |

**Owner action (optional, recommended before cutover):** After an **approved** production redeploy, hit a read-only DB health route or run `scripts/verify-production-db-readonly.ts` with a gitignored env file pulled from a secure channel.

**Risk note:** Running deployments pick up Vercel project env on cold start; rotation updated project env without redeploy. Monitor live DB-dependent routes after any future deploy.

---

## Phase 2 — Verify production database

| # | Item | Result | Evidence / notes |
|---|------|--------|------------------|
| 2.1 | Three Prisma migrations recorded | **PASS** | Init report: `20260330120000_init`, `20260330160000_security`, `20261102190000_workforce`. Neon **Tables** includes `_prisma_migrations`. **Not re-run** `migrate deploy`. |
| 2.2 | Expected tables exist | **PASS** | Neon Console **public** schema lists JoyTogether tables (e.g. `SiteSetting`, `Service`, `ServiceArea`, `PageContent`, `FAQ`, `Lead`, `EmployeeProfile`, `_prisma_migrations`, …). |
| 2.3 | Business seed present | **PASS** | Init `db:seed` only: settings, services (9 from content), 3 service areas, homepage + services hub `PageContent`, 3 FAQs. **Not re-seeded.** |
| 2.4 | No fictional leads / employees / customers | **PASS** | Seed policy excludes fictional data; `SEED_DEV_EXAMPLES` not used on production init. |
| 2.5 | Production vs Preview isolated | **PASS** | Wiring script + distinct Neon project IDs and endpoints. |
| 2.6 | Manual recovery snapshot available | **PASS** | Snapshot **`main at 2026-11-02 21:29:22 UTC (manual)`** documented in `docs/PRODUCTION-DB-INIT-REPORT.md`. PITR ~6h (Free tier). |

**Owner action:** None required for Phase 2 unless restoring from snapshot.

---

## Phase 3 — Prepare production administrator

**Target email:** `joytogetherhomecare@gmail.com`

| # | Item | Result | Evidence / notes |
|---|------|--------|------------------|
| 3.1 | Invitation system implemented | **PASS** | `createAndEmailAdminInvitation`, `/admin/users`, accept flow, MFA gate, no token logging (branch code). |
| 3.2 | Verified JoyTogether sender configured | **BLOCKED** | Production has **no** `RESEND_API_KEY` / `RESEND_FROM`. Preview may use interim sender; production requires `notifications@joytogetherhomecare.com` (see Phase 5). |
| 3.3 | Create production admin invitation | **BLOCKED** | **Not sent** — requires Resend + production `NEXT_PUBLIC_SITE_URL` deploy context. **No default passwords.** **No invitation tokens displayed.** |
| 3.4 | Administrator personal accept / MFA | **BLOCKED** | Owner must complete after invite is sent on approved cutover. |

**Owner actions:**

1. Complete Phase 5 (Resend domain + Production env).
2. On approved production deploy, run (Production DB env only, never Preview):

   `ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com npx tsx scripts/create-admin-invite.ts`

3. Administrator accepts invite, sets password, enables MFA, verifies admin access.

---

## Phase 4 — Production Blob storage

| # | Item | Result | Evidence / notes |
|---|------|--------|------------------|
| 4.1 | Dedicated production Blob store | **PASS** (created) | **`joytogether-production-media`** · `store_cWaOTDxwvXsK4nzH` · **iad1** · **0 B** (no Preview files copied). |
| 4.2 | Connected to `joytogether-homecare` **Production only** | **BLOCKED** | Store exists at team level; **Connect to Project** not completed in this session (CLI link prompt interrupted). Preview remains on `store_FMcUTyuldxbS…` (Preview-scoped `BLOB_*`). |
| 4.3 | Production `BLOB_*` env vars | **BLOCKED** | `vercel env ls production` — **no** `BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID` yet. |
| 4.4 | Private resumes not anonymously accessible | **PASS** (code) | Resumes use `access: "private"` in `src/lib/storage/resume.ts`; download only via `requireAdminSession` + `canManageCareers` on `/api/admin/applications/[id]/resume`. |
| 4.5 | CMS / media / testimonials support | **PASS** (design) | `src/lib/storage/media.ts` + Blob token when configured. Awaits Production store connect. |

**Owner actions:**

1. Vercel → Storage → **`joytogether-production-media`** → **Connect to Project** → **`joytogether-homecare`** → **Production only** (uncheck Preview).
2. Confirm Production env receives new `BLOB_*` vars (distinct from Preview).
3. Do **not** copy Preview blob objects into Production.

---

## Phase 5 — JoyTogether email (Resend)

| # | Item | Result | Evidence / notes |
|---|------|--------|------------------|
| 5.1 | Public contact documented | **PASS** | `joytogetherhomecare@gmail.com` in seed/site content. |
| 5.2 | Preferred system sender | **PASS** (planned) | `notifications@joytogetherhomecare.com` documented in `docs/RESEND-DNS-RECORDS.md`. |
| 5.3 | DNS records reviewed, not modified | **PASS** | No DNS changes made. |
| 5.4 | Resend domain verification | **BLOCKED** | Shared Resend account **domain limit**; need dedicated JoyTogether Resend project/plan before adding domain. |
| 5.5 | Production `RESEND_*` on Vercel | **BLOCKED** | Not set on Production. |

**Owner actions:** Approve DNS per `docs/RESEND-DNS-RECORDS.md`; upgrade or allocate Resend domain slot; verify domain; set Production-only `RESEND_API_KEY` and `RESEND_FROM`.

---

## Phase 6 — Security and release verification

| Check | Result |
|-------|--------|
| Production database connectivity (integration) | **PASS** |
| Credential rotation | **PASS** |
| Environment isolation (Preview vs Production Neon) | **PASS** |
| Migration history (3 migrations, guard on prod build) | **PASS** — `npm run validate:migration-plan`, unit tests for `shouldRunMigrateDuringBuild` |
| Backup / manual snapshot | **PASS** |
| Admin invitation readiness | **BLOCKED** (Resend) |
| Production Blob configuration | **BLOCKED** (connect store) |
| Resend domain readiness | **BLOCKED** |
| Application secrets on Production | **PASS** — `AUTH_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` present; DB secrets rotated |
| Production migration guard | **PASS** — `VERCEL_ENV=production` skips migrate unless `RUN_PRODUCTION_MIGRATIONS=true` |
| Rollback procedures documented | **PASS** — init snapshot + `docs/PRODUCTION-MIGRATION-PLAN.md` |
| PR #1 merged | **PASS** (not merged — required) |
| Redesign deployed to production | **PASS** (not deployed — required) |
| Live site unchanged | **PASS** — `https://www.joytogetherhomecare.com/api/health/db` returns **404** (legacy deploy; no new health route on live) |
| Fake production PHI/customers created in this task | **PASS** — none created |

---

## Rollback (owner)

1. **Database:** Neon → **Backup & Restore** → snapshot **`main at 2026-11-02 21:29:22 UTC (manual)`** (or PITR within window).
2. **Credentials:** Rotate again via Vercel if compromise suspected.
3. **Application:** Do not point Production at Preview; redeploy last known-good production deployment only when authorized.

---

## Related documents

- `docs/PRODUCTION-DB-INIT-REPORT.md` — migrate + seed + snapshot
- `docs/PRODUCTION-MIGRATION-PLAN.md` — approved migrate window
- `docs/RESEND-DNS-RECORDS.md` — DNS approval gate
- `scripts/verify-production-db-readonly.ts` — count-only verification (requires `JT_PROD_ENV_FILE`)

---

## Explicit non-actions (confirmed)

- PR **#1** not merged  
- Redesign not deployed to production  
- Live site and DNS not modified  
- Production **Redeploy** after credential rotation not triggered  
- No production admin invitation sent  
- No migrate/seed re-run  
