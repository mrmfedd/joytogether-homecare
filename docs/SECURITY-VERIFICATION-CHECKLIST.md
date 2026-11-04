# Security verification checklist — Production (PR #3 accepted)

**Date:** 2026-11-04  
**Method:** Read-only HTTP smoke + source-code review. **No** password resets, MFA changes, secret rotation, or database writes.

---

## Summary

| # | Control | Finding |
|---|---------|---------|
| 1 | SUPER_ADMIN limited to authorized users | **Pass (operational)** — Production DB smoke reports **1** active user account (technical maintainer). **`canManageUsers`** is **SUPER_ADMIN** only (`src/lib/permissions.ts`). |
| 2 | MFA enforced where required | **Pass (design)** — SUPER_ADMIN and ADMIN must enable MFA before full dashboard (`src/app/admin/(app)/layout.tsx`). Login requires TOTP when `mfaSecret` set (`src/lib/auth.ts`). |
| 3 | Session expiration / invalidation | **Pass (design)** — JWT **8-hour** max age (`auth.config.ts`). **`sessionVersion`** invalidates JWT after recovery/deactivate (`isJwtSessionValid`, unit tests). |
| 4 | Admin invitations expire | **Pass (design)** — **48 hours**; validation rejects expired/used tokens (`src/lib/admin/invitations.ts`). Prior invites burned on re-send. |
| 5 | Password-reset links expire | **Pass (design)** — Admin/employee reset tokens **1 hour** (`password-actions.ts` patterns). |
| 6 | Bootstrap super-admin absent | **Pass (live)** — `GET /api/bootstrap-super-admin` → **404** (production smoke). No route in tracked source. |
| 7 | Admin vs employee isolation | **Pass (design + smoke)** — Middleware redirects EMPLOYEE away from `/admin` and non-employees away from `/employee` app routes (`auth.config.ts`). Unauthenticated gates → login. |
| 8 | Report exports authorized | **Pass (live)** — All 7 categories × csv/xlsx/pdf → **401** without session (`/api/admin/reports/export`). Handler uses `requireAdminSession` + report role checks. |
| 9 | Private file access | **Pass (design)** — Resumes via `GET /api/admin/applications/[id]/resume` require admin session + `canManageCareers`. Blob access uses private `get()` with server token (`src/lib/storage/resume.ts`, `media.ts`). |
| 10 | Secrets not in source | **Pass (scan)** — No Neon/Resend key patterns in tracked files (2026-11-04 grep). Env files gitignored. |
| 11 | Auth actions audited | **Pass (design)** — `writeAuditLog` on LOGIN, invitations, lead/workforce mutations, etc. (`src/lib/audit.ts`). No in-app audit UI; rows in `AuditLog` table. |

---

## Gaps / follow-up (not failures)

- **Live MFA enforcement** for every privileged account: confirm each SUPER_ADMIN/ADMIN has MFA enabled in `/admin/account` (owner responsibility).
- **Authenticated export content** not byte-verified in automation (requires signed-in session).
- **Rate limiting** on login is in-memory per instance (not global Redis) — acceptable at current scale; note for future hardening.
- **Neon/API credentials** on operator workstations: keep in gitignored files only; rotate if ever exposed.

---

## Explicit non-actions (this review)

- No automatic secret rotation
- No password or MFA reset
- No disabling of auth protections
- No bootstrap or debug endpoints added
