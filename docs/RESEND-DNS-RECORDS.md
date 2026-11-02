# JoyTogether Resend DNS records (approval required before applying)

**Status:** Prepared for owner approval — **DNS has not been modified.**  
**Recommended sending domain:** `joytogetherhomecare.com` (apex) **or** `mail.joytogetherhomecare.com` (preferred if apex SPF/MX inventory is crowded).  
**Proposed From after verification:** `JoyTogether Home Care <notifications@joytogetherhomecare.com>`  
(If using the `mail.` subdomain: `notifications@mail.joytogetherhomecare.com`.)  
**Ops/lead recipient:** `joytogetherhomecare@gmail.com`

## Blocker before records can be generated

The shared Resend account used for Preview has hit its **domain limit**, so JoyTogether’s domain cannot be added until the owner:

1. Upgrades the Resend plan, **or**
2. Creates a **dedicated JoyTogether Resend project / API key** with an available domain slot.

After the domain is added in Resend → Domains, the dashboard **Records** tab is the source of truth for DKIM. Do not invent DKIM values.

## Exact records for apex domain `joytogetherhomecare.com` (Resend region `us-east-1`)

These match Resend’s documented record shape. Paste **Name** values without re-appending the zone if the DNS host already scopes to the apex.

| Purpose | Type | Name (DNS host field) | Value | Priority | TTL |
|---------|------|------------------------|-------|----------|-----|
| Bounce / complaint return-path (SPF MX) | `MX` | `send` | `feedback-smtp.us-east-1.amazonses.com` | `10` | Auto / 600 |
| Sending SPF | `TXT` | `send` | `v=spf1 include:amazonses.com ~all` | — | Auto / 600 |
| DKIM | `TXT` | `resend._domainkey` | **Exact `p=…` string from Resend dashboard** (unique per domain) | — | Auto / 600 |

Optional (recommended after SPF/DKIM verify):

| Purpose | Type | Name | Value |
|---------|------|------|-------|
| DMARC | `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:joytogetherhomecare@gmail.com` |

Fully-qualified names (if the DNS UI requires FQDN):

- `send.joytogetherhomecare.com`
- `resend._domainkey.joytogetherhomecare.com`
- `_dmarc.joytogetherhomecare.com`

## Exact records if using subdomain `mail.joytogetherhomecare.com`

Add domain `mail.joytogetherhomecare.com` in Resend. DNS names become:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| `MX` | `send.mail` | `feedback-smtp.us-east-1.amazonses.com` | `10` |
| `TXT` | `send.mail` | `v=spf1 include:amazonses.com ~all` | — |
| `TXT` | `resend._domainkey.mail` | **Exact DKIM `p=…` from Resend** | — |

> **Note:** Domains created on newer Resend plans may show **CNAME** return-path records instead of the MX+TXT SPF pair. Always publish exactly what the Resend Records tab shows for that domain.

## Why `send.` does not break Gmail inbox for `joytogetherhomecare@gmail.com`

Customer inquiries use `@gmail.com`, so apex MX for joytogetherhomecare.com is not required for that mailbox. Resend’s MX lives on `send.` (or `send.mail.`) and does **not** replace apex inbound MX used for Google Workspace / other `@joytogetherhomecare.com` mailboxes.

Still inventory existing apex SPF/DKIM/DMARC before changes so nothing is overwritten accidentally.

## Pre-change checklist (owner)

- [ ] Confirm DNS host (registrar / Vercel / GoDaddy / Cloudflare / Wix)
- [ ] Export current zone records
- [ ] Create dedicated Resend project or free a domain slot
- [ ] Add JoyTogether domain in Resend; copy DKIM value
- [ ] Explicit written approval to publish the three (or four) records above
- [ ] Verify in Resend → wait until status **Verified**
- [ ] Set Production `RESEND_FROM` / `RESEND_API_KEY`
- [ ] Send test to `joytogetherhomecare@gmail.com`; confirm SPF/DKIM pass in headers

## Env after verification (Production only)

```bash
RESEND_API_KEY=<joytogether-dedicated-key>
RESEND_FROM="JoyTogether Home Care <notifications@joytogetherhomecare.com>"
```

Preview may keep interim shared verified sender until cutover.

## Approval gate

**Do not add or edit DNS records until the owner explicitly approves.**
