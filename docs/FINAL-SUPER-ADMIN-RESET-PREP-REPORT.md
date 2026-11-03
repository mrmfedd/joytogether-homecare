# Final prep — Production SUPER_ADMIN reset (`mrmfedd@gmail.com`)

**Prepared:** 2026-11-03  
**Reset executed:** No (`--confirm` not run)

## Automated checks (this session)

| Check | Result |
|-------|--------|
| Unit tests (`npm run test:unit`) | **56 passed** (recovery, sessionVersion, reprovision rules) |
| Production build (`SKIP_MIGRATIONS=1 npm run build`) | **Pass** |
| Reset script `--confirm` | **Not run** |

## Security verification (code review)

| Requirement | How it is enforced |
|-------------|-------------------|
| No takeover via accept-invite | Standard invites return `account_exists` if a user row exists. Reprovision invites require `reprovisionUserId` to match the existing user for that email; otherwise `reprovision_mismatch`. Accept path calls `user.update` only for that id — never `user.create` for reprovision. |
| JWT invalidation | Reset/reprovision increments `User.sessionVersion`, deletes `Session` rows; JWT callback compares token vs DB (`isJwtSessionValid` — see `tests/unit/session-version.test.ts`). |
| Employee / business data | Reset script updates **one** `User` row + audit; census is read-only; no employee or lead mutations. |
| No DB recreate | Operator script only; no drop/create database. |

## Production deployment & schema (not ready until you complete steps below)

Reprovision **requires** on Production:

1. App deploy including reprovision accept-invite + invitation helpers (feature branch → merge → Production deploy).
2. Neon migrations **4–6** applied (`docs/PRODUCTION-MIGRATION-PLAN.md`).

**Current gap:** Reprovision code lives on `feature/in-app-user-manual` until merged; Production typically tracks `main`. Confirm Vercel Production deployment SHA includes reprovision **after** merge/deploy. Confirm `_prisma_migrations` includes `20261103140000_admin_reprovision_invite` before reset.

## Remaining steps to send a new invitation

1. **Merge & deploy** reprovision implementation to Vercel **Production** (when you approve the PR).
2. **Neon snapshot** on `joytogether-production` (manual snapshot or branch).
3. **`npx prisma migrate deploy`** on Production with unpooled URL (migrations through `20261103140000_admin_reprovision_invite`).
4. Create gitignored **`JT_PROD_ENV_FILE`** (`DATABASE_URL_UNPOOLED`, `RESEND_*`, `ADMIN_RECOVERY_SECRET`, `NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com`).
5. **Inspect:**  
   `JT_PROD_ENV_FILE=… ADMIN_INVITE_EMAIL=mrmfedd@gmail.com npx tsx scripts/reset-production-super-admin.ts`  
   Confirm `productionIdentityVerified`, target `SUPER_ADMIN`, `reprovisionMigrationApplied: true`, low business counts.
6. **Execute (authorized):**  
   `NEON_BACKUP_ACK=1 ADMIN_RECOVERY_SECRET=…` + same env + `--confirm`  
   (see `docs/ADMIN-SUPER-ADMIN-RESET.md`).
7. Open **email** one-time link → set password → **https://www.joytogetherhomecare.com/admin/login** → enroll MFA.

## Administrator login URL

**https://www.joytogetherhomecare.com/admin/login**

Invitation delivery status: **pending** until step 6 completes successfully.
