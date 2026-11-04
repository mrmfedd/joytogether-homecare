# Administrator onboarding guide — business owner (ADMIN)

**Owner email:** `joytogetherhomecare@gmail.com`  
**Recommended role:** **ADMIN** (not SUPER_ADMIN)  
**Production site:** https://www.joytogetherhomecare.com  
**Status:** **Invitation not sent** — follow steps below when authorized.

---

## Why ADMIN (not SUPER_ADMIN)

| Capability | ADMIN | SUPER_ADMIN |
|------------|:-----:|:-----------:|
| Leads, consultations, workforce, reports | Yes | Yes |
| Website content, services, careers | Yes | Yes |
| Settings (business contact) | Yes | Yes |
| Invite/deactivate **administrator** users | **No** | Yes |
| Help Center CMS (`/admin/help/manage`) | **No** | Yes |

SUPER_ADMIN remains with the technical maintainer (`mrmfedd@gmail.com`) per launch plan.

---

## ADMIN role verification (application code)

From `src/lib/permissions.ts` and `src/lib/workforce/permissions.ts`, **ADMIN** can:

- **Leads** — view and manage (`canManageLeads`)
- **Consultations & scheduling** — workforce modules (`canManageScheduling`, `canManageWorkforce`)
- **Employees** — invite and manage profiles (`canManageEmployees`)
- **Open shifts, time-off, notices, timesheets** — workforce admin actions
- **Reports** — seven categories (`canViewReports` / workforce reports)
- **Website content, services, service areas** — (`canManageContent`, `canManageServices`)
- **Job applications / careers** — (`canManageCareers`)
- **Settings** — business settings (`canManageSettings`)

ADMIN **cannot** open **Admins** user management or Help CMS unless elevated (by design).

---

## Secure invitation process (do not run until authorized)

**Prerequisite:** Active **SUPER_ADMIN** session on Production with Resend configured (`RESEND_API_KEY`, `RESEND_FROM` on Vercel Production).

### Preferred — Administrator Portal

1. Sign in as SUPER_ADMIN → https://www.joytogetherhomecare.com/admin/login  
2. Complete MFA if prompted.  
3. Open **Admins** (`/admin/users`).  
4. **Send invitation**  
   - Email: `joytogetherhomecare@gmail.com`  
   - Role: **ADMIN**  
5. Owner receives email from JoyTogether notifications address (48-hour link).  
6. **Do not** forward invitation links or paste tokens in chat.

### Owner acceptance flow

1. Open the one-time link → `/admin/accept-invite`  
2. Set **display name** and **password** (minimum **12** characters).  
3. Sign in at `/admin/login`.  
4. Enable **authenticator MFA** on `/admin/account` (required before full dashboard for ADMIN).  
5. Walk through the **Administrator training checklist** in `docs/EMPLOYEE-ONBOARDING-GUIDE.md` (admin section).

### If invite expires

SUPER_ADMIN re-sends from **Admins** (old tokens are burned automatically).

---

## Training pointers

- In-app **Help Center:** `/admin/help` (searchable articles aligned with PR #3 operations).  
- **Reports:** `/admin/reports` — date range, Print, CSV, Excel, PDF.  
- **Weekly/monthly routines:** Help articles *Administrative dashboard*, *Weekly and monthly review*, *Reports and analytics*.

---

## Explicit non-actions

- Do **not** auto-elevate owner to SUPER_ADMIN.  
- Do **not** send invitation in this documentation-only session.  
- Do **not** create default passwords in the database.

See also: `docs/PRODUCTION-ADMIN-ONBOARDING.md` (historical role plan).
