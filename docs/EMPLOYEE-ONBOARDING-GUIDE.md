# Employee onboarding guide

**Production employee portal:** https://www.joytogetherhomecare.com/employee/login  
**Staff entry:** https://www.joytogetherhomecare.com/staff-login  

No employee accounts or invitations are created in this documentation pass.

---

## Employee workflow (implemented)

| Step | Path / behavior |
|------|------------------|
| Invitation email | Sent from **Employees** admin module (48-hour accept link) |
| Accept invite | `/employee/accept-invite` — password setup |
| Login | `/employee/login` — optional MFA if enabled on account |
| Dashboard | `/employee` |
| Schedule | `/employee/schedule` |
| Shift confirmation | Schedule actions (per assigned shifts) |
| Open shifts | `/employee/open-shifts` — request available shifts |
| Time off | `/employee/time-off` — submit requests |
| Notices | `/employee/notices` — read and acknowledge |
| Time clock | `/employee/time-clock` (when enabled for your organization) |
| Help | `/employee/help` — 26 published articles + FAQs |

Token rules mirror admin invites: hashed storage, expiry, burn on re-invite (`src/lib/employee/invitations.ts`).

---

## Employee onboarding checklist (per new hire)

**Administrator**

- [ ] Create employee profile in **Employees** with correct legal name, work email, classification, and credentials as required by policy.
- [ ] Send **employee invitation**; confirm Resend delivery (check spam).
- [ ] Confirm invite accepted before first shift (no outstanding expired invite).
- [ ] Verify employee can sign in and reach **Schedule** and **Notices**.
- [ ] Walk through **time-off** and **open shift** request flow (even if empty).
- [ ] If time clock is used, demonstrate clock in/out once in a test window.
- [ ] Point employee to **Help Center** and emergency contact on public site.

**Employee**

- [ ] Open invitation link within **48 hours**.
- [ ] Choose a strong password (12+ characters); do not share it.
- [ ] Enable MFA on account security if offered/required.
- [ ] Bookmark **Staff Login** and save agency contact number from Help or public site.
- [ ] Read **schedule** and **notices** weekly.
- [ ] Submit **time-off** early; use **open shifts** only when qualified.

---

## Administrator training checklist (operations)

Use after owner ADMIN or coordinator accounts are active.

**Daily**

- [ ] Review **Leads** and new **Consultations**; respond per agency SLA.
- [ ] Check **Open shifts** and **Time off** queues.
- [ ] Scan **Staff notices** due dates.

**Weekly**

- [ ] Open **Reports** — rotate through categories (leads, consultations, private duty, employees, shifts, time off, timesheets).
- [ ] Export or print summaries for leadership (CSV/Excel/PDF/Print on `/admin/reports`).
- [ ] Confirm schedule coverage for the next 7–14 days.

**Monthly**

- [ ] Reconcile **timesheets** (if time clock enabled).
- [ ] Review **Private duty** census and consultation outcomes.
- [ ] Audit **website content** and **services** for accuracy (ADMIN can edit; SUPER_ADMIN for Help CMS).

**Help**

- [ ] Use `/admin/help` — articles *Customer leads*, *Consultations*, *Reports and analytics*, *Weekly and monthly review*.

---

## Sending employee invitations (when authorized)

1. **Admin portal** → **Employees** → create profile → **Send invitation**.  
2. Employee completes accept-invite flow.  
3. Re-send from Employees if expired (new token; old burned).

Do **not** create test employees on Production without approval.

---

## Related docs

- `docs/ADMINISTRATOR-ONBOARDING-GUIDE.md` — owner ADMIN invite  
- `docs/HELP-CENTER-MAINTENANCE.md` — updating help content (SUPER_ADMIN CMS)
