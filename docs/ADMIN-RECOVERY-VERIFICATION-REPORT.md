# Safe administrator recovery — verification report

**Branch:** `feature/in-app-user-manual`  
**Date:** 2026-11-03  
**Subject email:** `mrmfedd@gmail.com`  
**Production site:** https://www.joytogetherhomecare.com  

**Status:** Security review complete on branch. **No Production merge, deploy, recovery email, password reset, or MFA change was performed.**

---

## Step 1 — Production inspection

### Connection status

| Source | Result |
|--------|--------|
| `vercel env pull --environment=production` | Updated `.env.production.local`, but **Neon/Postgres URLs are `[SENSITIVE]` placeholders** (Vercel does not export integrated DB secrets to local pull). |
| `JT_USE_PRODUCTION_ENV=true` + `inspect-admin-account.mjs` | **Blocked** — no usable `DATABASE_URL` / unpooled URL locally. |
| **Preview Neon** (isolated host `ep-summer-band-…`) | **Read-only inspect succeeded** — documents Preview only, **not Production**. |

### Authoritative Production check (operator action required)

Copy the **Production Neon unpooled** connection string from the **Vercel → Storage/Neon integration** or **Neon console** into a **gitignored** file (e.g. `JT_PROD_ENV_FILE`), then run:

```bash
JT_PROD_ENV_FILE=/path/to/prod-neon.env \
ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
node scripts/inspect-admin-account.mjs
```

The script prints **roles, MFA flags, invite state, and `recommendedRecovery` only** — no hashes, secrets, or tokens.

### Preview read-only findings (for comparison only)

| Question | Preview answer |
|----------|----------------|
| Account exists? | **Yes** |
| Active? | **Yes** |
| Role? | **SUPER_ADMIN** |
| MFA enrolled? | **Yes** (`mfaEnabled: true`, MFA secret present) |
| Pending invitation? | **No** (prior SUPER_ADMIN invite **accepted**) |
| Recommended procedure | **`FORGOT_PASSWORD_INSUFFICIENT_IF_MFA_LOST_USE_ACCOUNT_RECOVERY`** |

### Production findings

**Not verified in this session** — blocked by missing local Production DB URL. Preview and Production use **different Neon hosts** (`compare-db-identities.ts`: Preview populated, Production pull empty/placeholder).

**Safest assumption until Production inspect succeeds:** treat Production like Preview if the same invite/onboarding was completed on Production; otherwise use **invitation flow** if inspect shows no user.

---

## Step 2 — Security review (recovery implementation)

| # | Requirement | Verdict | Notes |
|---|-------------|---------|--------|
| 1 | Cryptographically secure tokens | **Pass** | `randomBytes(32)` (256-bit) in `initiate-admin-account-recovery.mjs`. |
| 2 | Hashed before storage | **Pass** | SHA-256 hash stored; raw token only in email URL. |
| 3 | 30-minute expiry | **Pass** | `expiresAt = now + 30 min`; validated in `validateAdminRecoveryToken`. |
| 4 | Single use | **Pass** | `usedAt` set on completion; rejected if already used. |
| 5 | Not arbitrary email self-service | **Pass** | Initiation requires **`ADMIN_RECOVERY_SECRET`** (32+ chars) + **`--confirm`**; not exposed as a public form. Email link proves mailbox control. |
| 6 | Password + MFA re-enrollment | **Pass** | Recovery page requires 12+ char password; clears MFA fields; **`MfaRequiredGate`** forces new TOTP for SUPER_ADMIN/ADMIN after login. |
| 7 | Invalidate sessions immediately (incl. JWT) | **Pass (after branch update)** | Recovery increments **`User.sessionVersion`**; JWT callback invalidates tokens when version mismatches. Also deletes DB `Session` rows. |
| 8 | Preserve SUPER_ADMIN role | **Pass** | Recovery updates password/MFA/session only — **role unchanged**. |
| 9 | Audit log | **Pass** | `ADMIN_ACCOUNT_RECOVERY_INITIATED` (script) and `ADMIN_ACCOUNT_RECOVERY_COMPLETED` (app action). |
| 10 | Cannot target arbitrary admins without authorization | **Pass (hardened)** | Initiate script restricted to **`SUPER_ADMIN`** and **`ADMIN_RECOVERY_ALLOWED_EMAILS`** (default `mrmfedd@gmail.com`). |

### Residual risks (accepted for launch review)

- **`ADMIN_RECOVERY_SECRET` compromise** equals ability to start recovery for allowlisted SUPER_ADMIN — rotate secret if leaked; store only in Vercel Production.
- **Public `/admin/account-recovery`** accepts a token if leaked within 30 minutes — mitigated by single-use, HTTPS, and email-only delivery.
- **Forgot-password** path remains separate and **does not** clear MFA (by design).

---

## Step 3 — Validation

| Check | Result |
|-------|--------|
| Unit tests (`npm run test:unit`) | **48/48 passed** (help center, recovery hashing, existing suites) |
| Permission script | **Passed** via local `tsx` binary (npm script hit local esbuild quirk on this machine) |
| Production build (`SKIP_MIGRATIONS=1 npm run build`) | **Succeeded** |
| Portal regression | No changes to lead/workforce permission matrices; Help Center is additive routes/sidebar links |

**Migrations on branch (not applied to Production in this work):**

- `20261031120000_help_center`
- `20261103120000_admin_account_recovery`
- `20261103130000_user_session_version`

---

## Step 4 — Safest recovery option (after Production inspect)

| Production inspect result | Safest action |
|---------------------------|---------------|
| No user + valid pending invite | Accept invite email — **no recovery** |
| No user + no valid invite | `create-admin-invite.ts` with Production env (SUPER_ADMIN) |
| Active SUPER_ADMIN + MFA secret + lost authenticator | Deploy branch → set `ADMIN_RECOVERY_SECRET` → migrate → **`initiate-admin-account-recovery.mjs --confirm`** → complete link → login → enroll MFA |
| Active admin, MFA secret absent | `/admin/forgot-password` then MFA setup on `/admin/account` |

**Do not merge or run `--confirm` until you approve this review and confirm Production inspect output.**

---

## Help Center status (same branch)

| Item | Status |
|------|--------|
| Admin `/admin/help` + employee `/employee/help` | Implemented |
| Content | 25 admin + 26 employee seeded articles, FAQs |
| SUPER_ADMIN CMS | `/admin/help/manage` |
| Contextual Help | Key admin pages (employees, scheduling, open shifts, time off, notices, leads) |
| Tests | `tests/unit/help-center.test.ts` |
| Docs | `docs/HELP-CENTER-MAINTENANCE.md`, `docs/HELP-CENTER-IMPLEMENTATION-REPORT.md` |
| Deploy dependency | Help migration + `db:seed` on Preview before articles appear |

Recommend **one Preview deployment** to exercise Help Center + account-recovery UI (without `--confirm` on Production) before merging to `main`.

---

## Operator checklist before Production recovery

1. Run Production **`inspect-admin-account.mjs`** with `JT_PROD_ENV_FILE`.
2. Merge PR after Preview QA (Help + recovery routes).
3. Set **`ADMIN_RECOVERY_SECRET`** on Vercel Production (new random 32+ chars).
4. Run Production migrations (includes recovery + sessionVersion).
5. Run **`initiate-admin-account-recovery.mjs --confirm`** once with Production env.
6. Complete recovery link; verify audit log entries; enroll MFA.

See also: `docs/ADMIN-ACCOUNT-RECOVERY.md`.
