# Production infrastructure blocker resolution

**Date:** 2026-11-02  
**Project:** `joytogether-homecare` · branch `upgrade/customer-acquisition-redesign` · PR **#1 open (not merged)**  
**Live site / production deploy:** **Unchanged**

---

## Phase 1 — Production Blob storage

| Task | Result |
|------|--------|
| Store `joytogether-production-media` exists (`store_cWaOTDxwvXsK4nzH`, iad1, 0 B) | **PASS** |
| Connect to `joytogether-homecare` **Production only** | **BLOCKED** — Vercel UI requires selecting the **existing** project (not “Create a New Project”); environment toggles stay read-only until the real project is selected. Automated connect did not create Production `BLOB_*` vars. |
| Production `BLOB_*` on Vercel | **BLOCKED** — `vercel env ls production` shows no Blob vars yet |
| Preview retains `store_FMcUTyuldxbS…` (Preview-scoped) | **PASS** |
| Private resume protection (code) | **PASS** — private Blob + admin-only API |
| Fictional uploads to Production | **PASS** — none |

**Owner action (≈2 minutes):**

1. Vercel → Storage → **`joytogether-production-media`** → **Connect to Project**.
2. In the project search, choose **`joytogether-homecare`** (the existing project row — **not** “Create a New Project”).
3. Environments: **Production only** (uncheck Preview and Development, same pattern as Production Neon connect).
4. Prefix: **`BLOB`** (default).
5. **Connect Project** → confirm `vercel env ls production` lists `BLOB_STORE_ID`, `BLOB_READ_WRITE_TOKEN`, `BLOB_WEBHOOK_PUBLIC_KEY` with **Production** scope only.
6. Run `npm run verify:production-blob-wiring`.

---

## Phase 2 — Production database verification (read-only)

| Check | Result | Evidence |
|-------|--------|----------|
| Production identity | **PASS** | Neon `weathered-term-63569834`, endpoint `ep-nameless-hall-bb84dosp…` (≠ Preview `lucky-fire-28361357` / `ep-summer-band-bc49hrns`) |
| Vercel wiring after credential rotation | **PASS** | `npm run verify:production-wiring` → `ok: true`; Production DB env keys present (encrypted), updated post-rotation |
| TCP read-only check (local CLI) | **BLOCKED** | `vercel env pull` omits sensitive DB URL values; use Neon Console / Vercel **Browse data**, or `JT_PROD_ENV_FILE` + `npm run verify:production-db-readonly` |
| Post-rotation connection validity | **PASS** (integration) | Neon Console reachable on production project; compute active |
| Three migrations | **PASS** | Init report; `_prisma_migrations` table present (no re-run) |
| Expected tables | **PASS** | Neon **public** schema lists full Prisma table set |
| Essential seed | **PASS** | Init seed only: settings, 9 services, 3 service areas, homepage + hub content, 3 FAQs |
| Zero fictional leads/employees/users | **PASS** | Seed policy + init procedure |
| Preview isolation | **PASS** | Preview Neon vars Preview-scoped only |

**No migrate/seed re-run.**

---

## Phase 3 — Resend email

| Item | Result |
|------|--------|
| Review shared account / domain limit | **PASS** (documented) — Preview uses verified **Teez By Design** sender; JoyTogether domain blocked by **domain slot limit** on shared account |
| Production must not use Teez sender | **PASS** (policy) — Production has **no** `RESEND_*` yet |
| Preferred sender `notifications@joytogetherhomecare.com` | **PASS** (planned) |
| Recipient `joytogetherhomecare@gmail.com` | **PASS** |
| DNS records prepared | **PASS** — `docs/RESEND-DNS-RECORDS.md` (not published) |
| DNS / billing changes | **BLOCKED** — owner approval required |

**Exact owner steps (after approval):**

1. Create or upgrade a **JoyTogether-only** Resend account (free domain slot).
2. Add domain `joytogetherhomecare.com` (or `mail.joytogetherhomecare.com`) in Resend → copy **exact** DKIM from Records tab.
3. Approve and publish DNS per `docs/RESEND-DNS-RECORDS.md`.
4. Wait for **Verified** in Resend.
5. Set Vercel **Production only:** `RESEND_API_KEY`, `RESEND_FROM="JoyTogether Home Care <notifications@joytogetherhomecare.com>"`.
6. Send test to `joytogetherhomecare@gmail.com`; confirm SPF/DKIM in headers.

---

## Phase 4 — Administrator onboarding

| Item | Result |
|------|--------|
| Invitation flow in codebase | **PASS** |
| Production invite to `joytogetherhomecare@gmail.com` | **BLOCKED** — until Production Resend verified + deploy plan approved |
| Owner activation steps documented | **PASS** — `docs/PRODUCTION-ADMIN-ONBOARDING.md` |

---

## Phase 5 — Final scorecard

| # | Item | Result |
|---|------|--------|
| 1 | Production Blob connection | **BLOCKED** — owner UI connect (see Phase 1) |
| 2 | Preview / Production Blob isolation | **PASS** (Preview intact); **BLOCKED** until Production store connected |
| 3 | Production database connectivity after credential rotation | **PASS** (Vercel + Neon integration); local TCP **BLOCKED** without gitignored env file |
| 4 | Production database integrity | **PASS** |
| 5 | Resend domain readiness | **BLOCKED** — account slot + DNS approval |
| 6 | Administrator onboarding readiness | **BLOCKED** — Resend + approved deploy |
| 7 | Final production deployment readiness | **BLOCKED** — complete Blob connect, Resend, admin invite, then separate PR merge/deploy authorization |

---

## Explicit non-actions

- PR **#1** not merged  
- Redesign not deployed  
- Live website not changed  
- No production migrate/seed re-run  
- No production admin invitation sent  
- No DNS or Resend billing changes without approval  
