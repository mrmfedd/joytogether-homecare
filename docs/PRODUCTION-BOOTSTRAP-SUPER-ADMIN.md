# Production SUPER_ADMIN bootstrap (one-time)

Temporary Production-only API route to send the **initial** SUPER_ADMIN invitation using Vercel-hosted `RESEND_*` and `DATABASE_URL` (no local Resend copy).

## Enable (Vercel Production)

Set **`ADMIN_BOOTSTRAP_ENABLED=true`** on Production, then deploy this hotfix branch.

## Invoke once

Use **`Authorization: Bearer`** with **`CRON_SECRET`** or **`AUTH_SECRET`** from your Production env (same values as Vercel; not the Resend key):

```bash
curl -sS -X POST "https://www.joytogetherhomecare.com/api/internal/bootstrap-super-admin" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Response includes **`resendMessageId`** only (no invitation token).

## Disable after success

1. Set **`ADMIN_BOOTSTRAP_ENABLED=false`** (or remove) on Vercel Production.
2. Redeploy **main** without this route (merge cleanup or revert hotfix).

Repeat calls are blocked once a pending invitation or user exists.
