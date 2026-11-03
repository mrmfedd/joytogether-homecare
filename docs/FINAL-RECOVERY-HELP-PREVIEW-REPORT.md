# Final report — admin recovery & Help Center Preview

**Branch:** `feature/in-app-user-manual`  
**Date:** 2026-11-03  
**Administrator:** `mrmfedd@gmail.com`  

---

## 1. Production administrator inspection

### Connection

| Step | Result |
|------|--------|
| Authorized Neon Production identity (documented) | **`weathered-term-63569834`** · host marker **`ep-nameless-hall`** (≠ Preview `ep-summer-band`) |
| `vercel env pull --environment=production` | DB URLs remain **`[SENSITIVE]`** — not usable for TCP from this machine |
| `JT_PROD_ENV_FILE` in environment | **Not set** — no gitignored Production URL file was available to the agent |
| **Production read-only inspect executed?** | **No** — blocked until you provide unpooled URL |

### How to complete Production inspect (owner, one time)

1. In **Neon Console** → project **joytogether-production** → connection string → **unpooled**.
2. Save to a **gitignored** file, e.g. `~/.config/joytogether/production-neon.env`:

   ```env
   DATABASE_URL_UNPOOLED=postgresql://…
   NEON_PROJECT_ID=weathered-term-63569834
   ```

3. Run (read-only):

   ```bash
   JT_PROD_ENV_FILE=~/.config/joytogether/production-neon.env \
   ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
   node scripts/run-production-admin-inspect.mjs
   ```

The script **refuses Preview hosts** and sets `productionIdentityVerified` when the host matches **`ep-nameless-hall`** or project id matches **`weathered-term-63569834`**.

### Preview comparison (not Production)

Already verified on **Preview Neon** for the same email:

- Active **SUPER_ADMIN**, MFA enrolled, invite accepted  
- Recommended if Production matches: **account recovery** (not forgot-password alone)

**No Production MFA reset, recovery email, or password change was performed.**

---

## 2. Recovery readiness (after Production inspect confirms MFA)

| Item | Status |
|------|--------|
| `AdminAccountRecoveryToken` migration | On branch |
| `User.sessionVersion` + JWT invalidation | Implemented in **`auth.ts`** (not Edge middleware config) |
| Operator gate | `ADMIN_RECOVERY_SECRET` + `--confirm` |
| Target gate | **SUPER_ADMIN** + **`ADMIN_RECOVERY_ALLOWED_EMAILS`** (default `mrmfedd@gmail.com`) |
| Email proof | Single-use link, 30 minutes, Resend |
| Post-recovery | New password + **MFA re-enrollment** required |
| Audit | `ADMIN_ACCOUNT_RECOVERY_INITIATED` / `_COMPLETED` |
| Unit tests | **52** tests passing locally (includes `session-version`, recovery hashing) |

### sessionVersion / JWT verification

- **`tests/unit/session-version.test.ts`** — stale JWT rejected when DB `sessionVersion` increments (simulates post-recovery).
- Runtime check runs in **Node auth handler** (`auth.ts`), not in Edge-only `auth.config.ts` (fixes Preview build compatibility).

### Authorization summary

Recovery **cannot** be started from the public site. Only an operator with **`ADMIN_RECOVERY_SECRET`** matching Vercel Production can run `initiate-admin-account-recovery.mjs --confirm` for an **allowlisted SUPER_ADMIN** email.

---

## 3. Help Center — Preview database

Applied on **Preview Neon only** (read/write to Preview, not Production):

| Action | Result |
|--------|--------|
| `prisma migrate deploy` (Preview) | **Up to date** (6 migrations) |
| `prisma db seed` (Preview) | **Success** — includes Help Center |
| `node scripts/verify-preview-help-center.mjs` | **51 published articles** (25 admin + 26 employee), **24 FAQs** |

Role-scoped content is enforced in app code (`canViewHelpArticle`, separate admin/employee audiences). SUPER_ADMIN CMS: `/admin/help/manage`.

---

## 4. Help Center — Preview deployment URL

**Preview DB is ready.** Recent Vercel **Preview deployments for this branch showed build errors** (likely from Edge-incompatible auth config — **fixed** by moving JWT/`sessionVersion` logic to `auth.ts`).

| Deployment | URL | Notes |
|------------|-----|--------|
| Last **Ready** Preview (may predate Help UI) | https://joytogether-homecare-9sgq99fiu-michael-fedds-projects.vercel.app | May **not** include latest Help routes until a green build |
| Branch alias (after next green deploy) | https://joytogether-homecare-git-feature-in-app-user-manual-michael-fedds-projects.vercel.app | Expected after push + successful CI/Preview |

**After the next successful Preview build**, verify manually:

- `/admin/help` and `/employee/help` (as appropriate roles)
- `/admin/help/manage` as **SUPER_ADMIN**
- Search + sample articles from each audience

**Do not merge to `main` or Production** until Preview UI verification passes.

---

## 5. Recommended order of operations

1. **You:** Run Production **`run-production-admin-inspect.mjs`** with `JT_PROD_ENV_FILE`.
2. **You:** Confirm green **Preview** deploy for `feature/in-app-user-manual`; test Help Center URLs above.
3. **You:** Merge PR when Preview + inspect satisfy you.
4. **Production:** Set `ADMIN_RECOVERY_SECRET`, run migrations, then **`initiate-admin-account-recovery.mjs --confirm`** only if inspect shows active SUPER_ADMIN + lost MFA.

---

## 6. What was not done (by design)

- No merge to `main`
- No Production deploy of Help Center or recovery
- No recovery email sent
- No MFA cleared on Production
