# Secure administrator account recovery

## Inspection first (no changes)

```bash
# Preview (local `.env.preview.local`)
ADMIN_INVITE_EMAIL=mrmfedd@gmail.com node scripts/inspect-admin-account.mjs

# Production (requires Neon URLs in `.env.production.local`)
JT_USE_PRODUCTION_ENV=true ADMIN_INVITE_EMAIL=mrmfedd@gmail.com node scripts/inspect-admin-account.mjs
```

Read `recommendedRecovery` in the JSON output.

| Recommendation | Action |
|----------------|--------|
| `ACCEPT_PENDING_INVITE` | Use the invitation email link (`/admin/accept-invite`) — do **not** reset MFA. |
| `SEND_NEW_SUPER_ADMIN_INVITE` | Run `create-admin-invite.ts` with Production env (see `docs/PRODUCTION-ADMIN-ONBOARDING.md`). |
| `FORGOT_PASSWORD_THEN_ENROLL_MFA` | `/admin/forgot-password` only. |
| `FORGOT_PASSWORD_INSUFFICIENT_IF_MFA_LOST_USE_ACCOUNT_RECOVERY` | Use account recovery below (password reset does **not** clear MFA). |

## Ordinary self-service (when MFA device still works)

1. `/admin/forgot-password` → email link (1 hour) → new password.
2. Sign in with password **and** authenticator code.

## Lost password **and** authenticator (Production)

Requires a **one-time deploy** with migration `20261103120000_admin_account_recovery` and Production env var:

- `ADMIN_RECOVERY_SECRET` — 32+ random characters (operator-only, not committed)

### Operator steps (Production)

1. Set `ADMIN_RECOVERY_SECRET` on Vercel Production; redeploy.
2. Run migration on Production (existing `RUN_PRODUCTION_MIGRATIONS` policy).
3. From a secure machine with Production env loaded:

```bash
export ADMIN_RECOVERY_SECRET='…'   # matches Vercel Production
export ADMIN_INVITE_EMAIL=mrmfedd@gmail.com
JT_USE_PRODUCTION_ENV=true node scripts/initiate-admin-account-recovery.mjs --confirm
```

4. Check **mrmfedd@gmail.com** for the recovery link (30 minutes, single use).
5. Open link → set new password → sign in at `/admin/login`.
6. Complete **new MFA enrollment** on `/admin/account` (required for SUPER_ADMIN).

### What recovery does (this account only)

- Sends single-use link via Production Resend.
- On completion: new password, clears `mfaSecret` / `mfaEnabled`, invalidates DB sessions, marks token used.
- Writes audit log events `ADMIN_ACCOUNT_RECOVERY_INITIATED` and `ADMIN_ACCOUNT_RECOVERY_COMPLETED`.
- Does **not** change other users, disable MFA globally, or delete business data.

## Preview note (2026-11-03)

Preview Neon inspection showed **mrmfedd@gmail.com** as an **active SUPER_ADMIN** with **MFA enabled** and a stored MFA secret. **Production was not readable** from this workspace because the pulled Production env file had empty database URLs — re-pull Vercel Production env before acting on Production.
