# Production SUPER_ADMIN reset (single account)

Authorized operator reset for **one** existing `SUPER_ADMIN` (default allowlist: `mrmfedd@gmail.com`). Does **not** wipe the database or disable MFA globally.

## What it does

1. Verifies Production Neon identity (`ep-nameless-hall…` / project `weathered-term-63569834`).
2. Read-only census (admin accounts, lead/consultation counts, employee count).
3. Requires a **Neon manual snapshot** (`NEON_BACKUP_ACK=1`) before writes.
4. For the target user only:
   - Clears password hash and MFA enrollment
   - Increments `sessionVersion` (invalidates JWTs)
   - Deletes NextAuth `Session` rows
   - Burns outstanding admin invitations, recovery tokens, and password-reset tokens
   - Writes `ADMIN_SUPER_ADMIN_RESET_INITIATED` audit event
5. Sends a **reprovision** admin invitation (48h, single-use) via Production Resend to set a new password; MFA must be enrolled again after login.

## Prerequisites

| Item | Notes |
|------|--------|
| `JT_PROD_ENV_FILE` | Gitignored file with `DATABASE_URL_UNPOOLED`, `RESEND_API_KEY`, `RESEND_FROM`, `ADMIN_RECOVERY_SECRET`, optional `NEON_PROJECT_ID` |
| Migrations on Production | Including `20261103140000_admin_reprovision_invite` and prior recovery/sessionVersion migrations |
| Deploy | App code with reprovision accept-invite path merged and deployed to Production |
| `ADMIN_RECOVERY_SECRET` | Must match Vercel Production (32+ chars); export in shell only |

## Commands

**Inspect (no writes):**

```bash
JT_PROD_ENV_FILE=$HOME/.config/joytogether/production-neon.env \
ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
npx tsx scripts/reset-production-super-admin.ts
```

**Execute (after Neon snapshot):**

```bash
NEON_BACKUP_ACK=1 \
ADMIN_RECOVERY_SECRET='…' \
JT_PROD_ENV_FILE=$HOME/.config/joytogether/production-neon.env \
ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
npx tsx scripts/reset-production-super-admin.ts --confirm
```

## After the email

1. Open the one-time link → `/admin/accept-invite` on **www.joytogetherhomecare.com**
2. Set name + password (12+ characters)
3. Sign in at **https://www.joytogetherhomecare.com/admin/login**
4. Enroll MFA under Account → Security before full admin use

## Login URL

**https://www.joytogetherhomecare.com/admin/login**

## Agent session status

If `JT_PROD_ENV_FILE` is missing locally, Production inspect/reset **cannot** run from CI or the agent environment. Create the gitignored env file from Vercel/Neon consoles, apply migrations, deploy reprovision code, then run the commands above.

Never log invitation tokens, recovery links, password hashes, or API keys.
