# Production administrator onboarding

**Status:** Prepared — **invitations not sent until Production Resend is verified and deploy is approved.**

## Role plan (approved launch sequence)

| Order | Email | Role | When |
|-------|--------|------|------|
| 1 | `mrmfedd@gmail.com` | **SUPER_ADMIN** | First Production invite after deploy (technical maintainer) |
| 2 | `joytogetherhomecare@gmail.com` | **ADMIN** | After SUPER_ADMIN signs in → **Admin → Users → Send invitation** (business owner) |

Do **not** create default passwords, log invitation tokens, or bypass MFA.

## Prerequisites (all required)

1. **JoyTogether verified sender** on Vercel **Production** only:
   - `RESEND_FROM=JoyTogether Home Care <notifications@joytogetherhomecare.com>`
   - `RESEND_API_KEY` (dedicated JoyTogether Resend project key)
2. **Approved production deploy** (PR #1 merge + Production deployment).
3. **Production database** initialized (migrations + essential seed already applied — do not re-migrate or re-seed).
4. **Production Blob** connected (Production-only `BLOB_*` vars).

Preview may use the interim sender in `docs/RESEND-SENDER.md`. **Do not** use Teez By Design senders in Production.

## SUPER_ADMIN procedure (`mrmfedd@gmail.com`)

1. Confirm Production env: `NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com`, Resend vars, Neon Production, Blob Production.
2. From a secure machine with **Production** env only (never Preview DB URLs):

   ```bash
   ADMIN_INVITE_EMAIL=mrmfedd@gmail.com \
   ADMIN_INVITE_ROLE=SUPER_ADMIN \
   NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com \
   npx tsx scripts/create-admin-invite.ts
   ```

3. Accept invite → set password (12+ chars) → enable TOTP on `/admin/account` → confirm `/admin/users` loads.

## Owner ADMIN procedure (`joytogetherhomecare@gmail.com`)

After SUPER_ADMIN is active, use **Admin → Users → Send invitation**, role **ADMIN**. Do not reuse burned Preview invite links.

## Explicit non-actions

- No invitation sent during infrastructure-only sessions.
- No MFA bypass or pre-created passwords in the database.
- No temporary Resend verification API routes in Production builds.
