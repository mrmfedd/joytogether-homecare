# JoyTogether Resend sender (preview → production)

## Current Preview configuration

| Item | Value |
|------|--------|
| `RESEND_API_KEY` | Set on Vercel **Preview** only |
| `RESEND_FROM` | `JoyTogether Home Care <noreply@teezbydesign.com>` |
| Why this domain | Shared Resend account already verifies `teezbydesign.com` / `kingdomledger.net`. Adding `joytogetherhomecare.com` hit the account **domain limit**. |
| Recipient | Lead + ops emails go to `joytogetherhomecare@gmail.com` |

## Do not change DNS without approval

Before any DNS or MX/SPF/DKIM edits for `joytogetherhomecare.com` or the GoDaddy/Wix/Vercel DNS zone:

1. Inventory existing records (SPF, DKIM, DMARC, MX, CNAME).
2. Confirm who owns DNS (registrar vs Vercel).
3. Get explicit approval for the planned Resend DNS records.
4. Prefer a dedicated Resend project/API key for JoyTogether when the plan allows another domain.

## Recommended production sender (after approval)

1. Create or select a Resend project dedicated to JoyTogether.
2. Add domain `joytogetherhomecare.com` (or `mail.joytogetherhomecare.com` / `notifications.joytogetherhomecare.com`).
3. Publish Resend DNS records **only after approval**.
4. Set Production env:
   - `RESEND_FROM=JoyTogether Home Care <notifications@joytogetherhomecare.com>` (exact mailbox TBD)
   - `RESEND_API_KEY=<joytogether-only key>`
5. Send a test to `joytogetherhomecare@gmail.com` and confirm SPF/DKIM pass.

## Interim Preview branding note

Until JoyTogether’s domain is verified, Preview continues to use a verified shared-domain From address with JoyTogether display name. This is acceptable for Preview only — not for production launch.
