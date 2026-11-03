import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "fs";
import {
  REPORT_CATEGORIES,
  employeeLogin,
  localDateTimeInput,
  mfaAdminLogin,
  passwordAdminLogin,
  previewReady,
  qaFilesPresent,
  readJson,
  type MfaCreds,
  type PasswordCreds,
} from "./helpers/preview-auth";

const ARTIFACT_DIR = "/tmp/jt-preview-env/e2e-artifacts";

test.describe.configure({ mode: "serial" });

test.describe("PR3 admin portal operations (Preview)", () => {
  test.setTimeout(120_000);
  test.skip(!previewReady() || !qaFilesPresent(), "Requires PLAYWRIGHT_BASE_URL + /tmp/jt-preview-env/*.json");

  const superAdmin = () => readJson<MfaCreds>("qa-admin.json");
  const operatorAdmin = () => readJson<MfaCreds>("qa-operator.json");
  const viewer = () => readJson<PasswordCreds>("qa-viewer.json");
  const employee = () => readJson<PasswordCreds & { profileId?: string }>("qa-employee.json");

  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test("1 — SUPER_ADMIN and ADMIN sign-in", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 15_000 });
    await page.context().clearCookies();

    await mfaAdminLogin(page, operatorAdmin());
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("body")).toContainText(/admin|dashboard|leads/i);
  });

  test("2 — Open all seven reporting categories", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    for (const cat of REPORT_CATEGORIES) {
      await page.goto(`/admin/reports?category=${cat}`);
      await expect(page.getByRole("heading", { name: "Administrative reports" })).toBeVisible();
    }
  });

  test("3 — Download CSV, Excel, PDF and verify contents", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    const category = "leads";
    const formats = [
      { format: "csv", ext: "csv", sniff: (b: Buffer) => b.toString("utf8").includes(",") },
      { format: "xlsx", ext: "xlsx", sniff: (b: Buffer) => b.slice(0, 2).toString() === "PK" },
      { format: "pdf", ext: "pdf", sniff: (b: Buffer) => b.slice(0, 4).toString() === "%PDF" },
    ] as const;

    for (const { format, ext, sniff } of formats) {
      const res = await page.request.get(`/api/admin/reports/export?category=${category}&format=${format}`);
      expect(res.status(), `${format} status`).toBe(200);
      const body = Buffer.from(await res.body());
      expect(body.length, `${format} size`).toBeGreaterThan(40);
      expect(sniff(body), `${format} magic`).toBeTruthy();
      writeFileSync(`${ARTIFACT_DIR}/report-${category}.${ext}`, body);
    }
  });

  test("4 — Print report layout (print media)", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    await page.goto("/admin/reports?category=leads");
    await page.emulateMedia({ media: "print" });
    await expect(page.getByRole("button", { name: /Print report/i })).toBeHidden();
    await expect(page.locator(".report-print-header h1")).toContainText("Administrative reports");
    await expect(page.locator(".report-print-footer")).toBeVisible();
    await page.screenshot({ path: `${ARTIFACT_DIR}/report-print-leads.png`, fullPage: true });
  });

  test("5 — Lead create, edit, assign, follow-up, archive", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    const mark = `PW-Lead-${Date.now()}`;
    await page.goto("/admin/leads");
    await page.getByText("Create lead manually").click();
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: /Create lead/i }) });
    await form.locator('input[name="fullName"]').fill(`${mark} Person`);
    await form.locator('input[name="email"]').fill(`${mark}@example.com`);
    await form.locator('input[name="phone"]').fill("8135550100");
    await form.locator('input[name="serviceInterest"]').fill("Companionship QA");
    await form.getByRole("button", { name: /Create lead/i }).click();
    await expect(async () => {
      await page.goto(`/admin/leads?q=${encodeURIComponent(mark)}`);
      await expect(page.locator("tr").filter({ hasText: mark })).toBeVisible();
    }).toPass({ timeout: 45_000 });
    const row = page.locator("tr").filter({ hasText: mark });
    await row.getByRole("link", { name: "View" }).click();
    await page.locator('input[name="fullName"]').fill(`${mark} Person Updated`);
    await page.getByRole("button", { name: /Save fields/i }).click();
    await expect(page.locator("h1")).toContainText("Updated");

    await page.locator('form').filter({ hasText: "Assign staff" }).locator('select[name="assigneeId"]').selectOption({ index: 1 });
    await page.locator('form').filter({ hasText: "Assign staff" }).getByRole("button", { name: /^Assign$/i }).click();
    await expect(page.getByText(/assigned/i).first()).toBeVisible({ timeout: 15_000 });

    const followForm = page.locator("form").filter({ hasText: "Create follow-up task" });
    await followForm.locator('input[name="title"]').fill(`${mark} follow-up`);
    await followForm.locator('input[name="dueAt"]').fill(localDateTimeInput(new Date(Date.now() + 86400000)));
    await followForm.getByRole("button", { name: /Add task/i }).click();
    await expect(page.getByText(`${mark} follow-up`, { exact: true })).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /^Archive lead$/i }).click();
    await page.locator('input[name="confirm"]').fill("ARCHIVE");
    await page.getByRole("button", { name: /Confirm archive/i }).click();
    await expect(page).toHaveURL(/\/admin\/leads/, { timeout: 20_000 });
  });

  test("6 — Create and reschedule consultations (calendar)", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    const slot = new Date(Date.now() + 10 * 86400000);
    slot.setHours(14, 0, 0, 0);
    await page.goto("/admin/consultations");
    await page.getByText("New consultation").click();
    const cForm = page.locator("form").filter({ has: page.getByRole("button", { name: /Create consultation/i }) });
    const leadSelect = cForm.locator('select[name="leadId"]');
    const leadOption = leadSelect.locator("option").nth(1);
    const leadLabel = (await leadOption.textContent())?.trim() || "";
    expect(leadLabel.length).toBeGreaterThan(0);
    await leadSelect.selectOption({ index: 1 });
    await cForm.locator('input[name="scheduledAt"]').fill(localDateTimeInput(slot));
    await cForm.getByRole("button", { name: /Create consultation/i }).click();
    const mark = leadLabel.split("—")[0]?.trim() || leadLabel;
    await expect(page.getByText(mark).first()).toBeVisible({ timeout: 20_000 });

    await page.goto("/admin/consultations/calendar");
    await expect(page.getByRole("heading", { name: /Consultation calendar/i })).toBeVisible();
    const row = page.locator("li").filter({ hasText: mark }).first();
    if (await row.count()) {
      const moved = new Date(slot);
      moved.setHours(15, 0, 0, 0);
      await row.locator('input[name="scheduledAt"]').fill(localDateTimeInput(moved));
      await row.getByRole("button", { name: /Save changes/i }).click();
    }
    await page.goto("/admin/consultations");
    await expect(page.getByText(mark).first()).toBeVisible();
  });

  test("7 — Consultation scheduling conflict surfaced", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    const mark = `PW-Conflict-${Date.now()}`;
    const slot = new Date(Date.now() + 11 * 86400000);
    slot.setHours(10, 30, 0, 0);
    const slotLocal = localDateTimeInput(slot);

    for (const suffix of ["A", "B"]) {
      await page.goto("/admin/leads");
      await page.getByText("Create lead manually").click();
      const leadForm = page.locator("form").filter({ has: page.getByRole("button", { name: /Create lead/i }) });
      await leadForm.locator('input[name="fullName"]').fill(`${mark} ${suffix}`);
      await leadForm.locator('input[name="email"]').fill(`${mark}-${suffix}@example.com`);
      await leadForm.locator('input[name="phone"]').fill("8135550102");
      await leadForm.locator('input[name="serviceInterest"]').fill("QA");
      await leadForm.getByRole("button", { name: /Create lead/i }).click();
      await expect(async () => {
        await page.goto(`/admin/leads?q=${encodeURIComponent(mark)}`);
        await expect(page.locator("tr").filter({ hasText: `${mark} ${suffix}` })).toBeVisible();
      }).toPass({ timeout: 45_000 });
    }

    await page.goto("/admin/consultations");
    await page.getByText("New consultation").click();
    let cForm = page.locator("form").filter({ has: page.getByRole("button", { name: /Create consultation/i }) });
    await cForm.locator('select[name="leadId"]').selectOption({ label: `${mark} A` });
    await cForm.locator('input[name="scheduledAt"]').fill(slotLocal);
    await cForm.getByRole("button", { name: /Create consultation/i }).click();
    await expect(page.getByText(`${mark} A`).first()).toBeVisible({ timeout: 20_000 });

    await page.getByText("New consultation").click();
    cForm = page.locator("form").filter({ has: page.getByRole("button", { name: /Create consultation/i }) });
    await cForm.locator('select[name="leadId"]').selectOption({ label: `${mark} B` });
    await cForm.locator('input[name="scheduledAt"]').fill(slotLocal);
    await cForm.getByRole("button", { name: /Create consultation/i }).click();
    await expect(page.locator("text=/conflict|overlap|already scheduled/i").first()).toBeVisible({ timeout: 15_000 });
  });

  test("8 — Staff notices lifecycle", async ({ page, browser }) => {
    await mfaAdminLogin(page, superAdmin());
    const title = `PW Notice ${Date.now()}`;
    await page.goto("/admin/notices");
    await page.locator('input[name="title"]').fill(title);
    await page.locator('textarea[name="body"]').fill("Playwright notice body — no PHI.");
    await page.locator('input[name="requiresAck"]').check();
    await page.getByRole("button", { name: /Save draft notice/i }).click();
    await expect(page.getByRole("link", { name: title })).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: title }).click();
    await page.locator('input[name="title"]').fill(`${title} (edited)`);
    await page.getByRole("button", { name: /Save draft/i }).click();
    await expect(page.locator("h1")).toContainText("(edited)");

    await page.goto("/admin/notices");
    const card = page.locator("li").filter({ hasText: `${title} (edited)` });
    await card.getByRole("button", { name: /Publish & notify/i }).click();
    await expect(card.getByText(/Published/i)).toBeVisible({ timeout: 20_000 });

    const noticeHref = await card.getByRole("link", { name: `${title} (edited)` }).getAttribute("href");
    expect(noticeHref).toBeTruthy();

    const empCtx = await browser.newContext();
    const empPage = await empCtx.newPage();
    await employeeLogin(empPage, employee());
    await empPage.goto("/employee/notices");
    await expect(empPage.getByText(`${title} (edited)`).first()).toBeVisible({ timeout: 20_000 });
    const ackBtn = empPage.getByRole("button", { name: /Acknowledge/i }).first();
    if (await ackBtn.isVisible()) await ackBtn.click();

    await page.goto(noticeHref!);
    await page.getByRole("button", { name: /Archive notice/i }).click();
    await page.goto("/admin/notices?view=archived");
    await expect(page.getByText(`${title} (edited)`)).toBeVisible({ timeout: 15_000 });
    await empCtx.close();
  });

  test("9 — Review and process time-off requests", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    await page.goto("/admin/time-off");
    await expect(page.getByRole("heading", { name: /Time off requests/i })).toBeVisible();
    const pending = page.locator("li").filter({ hasText: /PENDING/i }).first();
    if (await pending.count()) {
      await pending.getByRole("button", { name: /^Approve$/i }).click();
      await expect(pending.getByText(/APPROVED/i)).toBeVisible({ timeout: 15_000 });
    }
  });

  test("10 — Open shifts administration", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    await page.goto("/admin/open-shifts");
    await expect(page.getByRole("heading", { name: /Open shifts/i })).toBeVisible();
    await expect(page.locator("body")).toContainText(/Publish|offer|shift/i);
  });

  test("11 — Timesheets admin and employee time clock", async ({ page, browser }) => {
    await mfaAdminLogin(page, superAdmin());
    await page.goto("/admin/timesheets");
    await expect(page.getByRole("heading", { name: /Timesheets/i })).toBeVisible();

    const empCtx = await browser.newContext();
    const empPage = await empCtx.newPage();
    await employeeLogin(empPage, employee());
    await empPage.goto("/employee/time-clock");
    await expect(empPage.getByRole("heading", { name: /Time clock/i })).toBeVisible();
    const clockIn = empPage.getByRole("button", { name: /Clock in/i });
    if (await clockIn.isVisible()) {
      await clockIn.click();
      await expect(empPage.getByRole("button", { name: /Clock out/i })).toBeVisible({ timeout: 15_000 });
      await empPage.getByRole("button", { name: /Clock out/i }).click();
    }
    await empCtx.close();
  });

  test("12 — Restricted admin and employee permissions", async ({ page, browser }) => {
    await passwordAdminLogin(page, viewer());
    await page.goto("/admin/reports");
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15_000 });
    await page.goto("/admin/leads");
    await expect(page.getByText("Create lead manually")).toHaveCount(0);

    await mfaAdminLogin(page, operatorAdmin());
    await page.goto("/admin/reports?category=leads");
    await expect(page.getByRole("heading", { name: "Administrative reports" })).toBeVisible();

    const empCtx = await browser.newContext();
    const empPage = await empCtx.newPage();
    await employeeLogin(empPage, employee());
    await empPage.goto("/admin/leads");
    await expect(empPage).toHaveURL(/\/employee/, { timeout: 15_000 });
    await empCtx.close();
  });

  test("13 — Contextual Help on timesheets and Help Center", async ({ page }) => {
    await mfaAdminLogin(page, superAdmin());
    await page.goto("/admin/timesheets");
    await page.getByRole("button", { name: /Open help:/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText(/report|timesheet|clock/i);
    await page.keyboard.press("Escape");
    await page.goto("/admin/help");
    await expect(page.getByRole("heading", { name: /Help/i })).toBeVisible();
    await expect(page.locator("a[href*='/admin/help/']").first()).toBeVisible();
  });

  test("14 — Public site and employee portal unaffected", async ({ request, page }) => {
    const base = process.env.PLAYWRIGHT_BASE_URL!;
    for (const path of ["/", "/services", "/contact", "/staff-login", "/employee/login"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(/Internal Server Error/i);
    const prod = await request.get("https://www.joytogetherhomecare.com/", { maxRedirects: 5 });
    expect(prod.status()).toBe(200);
  });
});
