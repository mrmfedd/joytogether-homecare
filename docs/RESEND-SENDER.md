# JoyTogether Resend sender (Preview vs Production)

## Production (authorized)

| Item | Value |
|------|--------|
| `RESEND_API_KEY` | Vercel **Production** only (dedicated JoyTogether Resend account) |
| `RESEND_FROM` | `JoyTogether Home Care <notifications@joytogetherhomecare.com>` |
| Domain | `joytogetherhomecare.com` — verified in Resend (owner confirmed) |
| Recipient (leads / ops) | `joytogetherhomecare@gmail.com` |
| Report | `docs/PRODUCTION-RESEND-CONFIGURATION.md` |

**Do not** use `noreply@teezbydesign.com` on Production.

---

## Preview (interim)

| Item | Value |
|------|--------|
| `RESEND_API_KEY` | Vercel **Preview** only (may differ from Production) |
| `RESEND_FROM` | `JoyTogether Home Care <noreply@teezbydesign.com>` |
| Why | Legacy shared Resend account verified `teezbydesign.com` while JoyTogether domain slot was blocked. Preview-only branding compromise. |
| Recipient | Lead emails still go to `joytogetherhomecare@gmail.com` |

Preview may keep the interim sender until Preview env is updated to match Production.

---

## DNS

Exact records and approval gate: `docs/RESEND-DNS-RECORDS.md`.  
**No DNS changes** without explicit approval.

---

## Verification

```bash
# Production domain + test send (requires gitignored JT_PROD_ENV_FILE)
JT_PROD_ENV_FILE=/path/to/production.env npm run verify:production-resend

# Compare Preview vs Production key fingerprints (gitignored local env files)
npm run verify:resend-env-isolation
```
