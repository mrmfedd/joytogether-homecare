# Preview initial administrator setup

**Date:** 2026-11-02  
**Branch:** `upgrade/customer-acquisition-redesign`  
**PR #1:** Not merged · **Production:** Unchanged · **Live website:** Unchanged  

---

## Initial SUPER_ADMIN (technical maintainer)

| Item | Status |
|------|--------|
| Email | `mrmfedd@gmail.com` |
| Role | **SUPER_ADMIN** |
| Preview DB account | **Not activated yet** (invite outstanding) |
| Valid invite in Preview Neon | **Yes** (expires ~2026-11-04 UTC) |
| Resend accepted | **Yes** |
| Resend message ID | `01a19e8d-c6de-7130-89d8-af25acf01170` |
| Inbox delivery | **Not confirmed** (owner must confirm Gmail) |

**Portal base URL (Preview):**  
`https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app`

**Accept path:** `/admin/accept-invite` (full link with one-time token is **only in email** — not stored in this report).

---

## Human activation (Phase 2 — required)

1. Open the invitation email at `mrmfedd@gmail.com`.
2. Set a password (**12+ characters**).
3. Sign in at Preview **Admin** (`/admin/login`).
4. **Account → Security** → enable **MFA (TOTP)**.
5. Confirm **Users** (`/admin/users`) and other SUPER_ADMIN tools load.

No bypass of auth or MFA.

---

## Business owner (Phase 3 — later)

| Item | Detail |
|------|--------|
| Owner email | `joytogetherhomecare@gmail.com` |
| Intended role | **ADMIN** (not SUPER_ADMIN) |
| Auto-invited in this setup | **No** |
| How to invite | After SUPER_ADMIN activation: **Admin → Users → Send invitation**, role **ADMIN** |

**ADMIN** can manage employees, scheduling, leads, consultations, content, testimonials, careers/applications, staff notices, and reports per `permissions.ts` / workforce permissions. **Only SUPER_ADMIN** can manage other admin users (`canManageUsers`).

**Note:** Preview still has an **older outstanding SUPER_ADMIN** invite for `joytogetherhomecare@gmail.com` from prior QA. Do **not** use it for owner onboarding. SUPER_ADMIN should send a **new ADMIN** invite from `/admin/users` (prior invites for that email are burned when re-inviting).

---

## Public contact (unchanged)

`site.contact.email` remains **`joytogetherhomecare@gmail.com`**.

---

## Database isolation

| Environment | Neon marker |
|-------------|-------------|
| Preview | `ep-summer-band-bc49hrns` / project `lucky-fire-28361357` |
| Production | No Production admin accounts created in this task |

---

## Temporary bootstrap (removed)

A one-time Preview-only bootstrap endpoint was used because CLI cannot read encrypted Preview `RESEND_*`. Bootstrap env vars **`PREVIEW_BOOTSTRAP_*`** were **removed** from Vercel Preview; bootstrap route files were **deleted** after successful invite.

Ongoing invites: `scripts/create-admin-invite.ts` (with `JT_PREVIEW_ENV_FILE` if needed) or **Admin → Users** after login.

---

## Verification commands

```bash
ADMIN_INVITE_EMAIL=mrmfedd@gmail.com npx tsx scripts/check-admin-account.ts
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com npx tsx scripts/check-admin-account.ts
npm run test:permissions
```
