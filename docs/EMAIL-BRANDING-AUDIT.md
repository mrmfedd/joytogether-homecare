# Customer-facing email branding audit

**Date:** 2026-11-02  
**Canonical brand source:** `src/content/site.ts`

| Field | Value |
|-------|-------|
| Display name | Joy Together Home Care |
| Legal name | JoyTogether Home Care LLC |
| Phone | (813) 820-0337 |
| Email | joytogetherhomecare@gmail.com |
| Site URL | https://www.joytogetherhomecare.com |

## Outbound messages reviewed

| Message | Code path | Branding | Contact footer |
|---------|-----------|----------|----------------|
| New lead notification (ops) | `src/lib/notifications.ts` → `sendLeadEmail` | Subject/body use `site.name`; To = `site.contact.email` | Phone, email, URL, legal name |
| Admin password reset | `sendPasswordResetEmail` | Subject/body use `site.name` | Same |
| Admin invitation | `scripts/create-admin-invite.ts` | Subject/body use `site.name` / legal name | Same |

## From address (transport)

| Env | Current From | Notes |
|-----|--------------|-------|
| Preview | `JoyTogether Home Care <noreply@teezbydesign.com>` | Shared verified domain; display name is JoyTogether |
| Production (planned) | `JoyTogether Home Care <notifications@…joytogetherhomecare.com>` | Requires Resend domain + DNS approval |

## Result

**PASS** for content branding and contact information.  
**BLOCKED for production From-domain** until owner-approved Resend DNS verification (`docs/RESEND-DNS-RECORDS.md`).
