import { test, expect } from "@playwright/test";
import { generateSync } from "otplib";
import { existsSync, readFileSync } from "fs";

const previewOnly = !!process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app");
const adminPath = "/tmp/jt-preview-env/qa-admin.json";
const employeePath = "/tmp/jt-preview-env/qa-employee.json";
const previewReady =
  previewOnly && existsSync(adminPath) && existsSync(employeePath);

function shiftWindow() {
  const start = new Date();
  start.setDate(start.getDate() + 60 + (Date.now() % 14));
  start.setHours(22, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const local = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return {
    startLocal: local(start),
    endLocal: local(end),
    startDate: start.toISOString().slice(0, 10),
    weekQuery: weekStart.toISOString(),
  };
}

test.describe.configure({ mode: "serial" });

test.describe("preview workforce workflows", () => {
  test.skip(!previewReady, "Requires preview URL + qa-admin.json + qa-employee.json");

  test("admin schedules, employee confirms shift, time off reviewed", async ({ page, browser }) => {
    await page.context().clearCookies();
    const admin = JSON.parse(readFileSync(adminPath, "utf8")) as {
      email: string;
      password: string;
      mfaSecret: string;
    };
    const employee = JSON.parse(readFileSync(employeePath, "utf8")) as {
      email: string;
      password: string;
      profileId: string;
    };
    const { startLocal, endLocal, startDate, weekQuery } = shiftWindow();
    const uniqueTitle = `PW Shift ${Date.now()}`;

    const code = generateSync({ secret: admin.mfaSecret });
    await page.goto("/admin/login");
    await page.getByLabel(/^Email$/i).fill(admin.email);
    await page.getByLabel(/^Password$/i).fill(admin.password);
    await page.getByLabel(/Authenticator code/i).fill(code);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/\/admin(?:\/(?!login)|$)/, { timeout: 20000 });

    await page.goto(`/admin/scheduling?week=${encodeURIComponent(weekQuery)}`);
    await expect(page.getByRole("heading", { name: /Scheduling/i })).toBeVisible();
    const createForm = page.locator("form").filter({ hasText: "New shift (draft)" });
    await createForm.locator('input[name="title"]').fill(uniqueTitle);
    await createForm.locator('input[name="startsAt"]').fill(startLocal);
    await createForm.locator('input[name="endsAt"]').fill(endLocal);
    await createForm.getByRole("button", { name: /Create draft shift/i }).click();
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 15000 });

    const shiftCard = page.locator("li").filter({ hasText: uniqueTitle });
    await shiftCard.getByRole("button", { name: /^Publish$/i }).click();
    await expect(shiftCard.getByText(/PUBLISHED/i)).toBeVisible({ timeout: 15000 });

    const profileSelect = shiftCard.locator('select[name="profileId"]');
    await profileSelect.selectOption(employee.profileId);
    await shiftCard.getByRole("button", { name: /^Assign$/i }).click();
    await page.reload();
    const assignedCard = page.locator("li").filter({ hasText: uniqueTitle });
    await expect(assignedCard.getByText(/Assigned:/i)).toBeVisible({ timeout: 15000 });

    const employeeContext = await browser.newContext();
    const employeePage = await employeeContext.newPage();
    await employeePage.goto("/employee/login");
    await employeePage.getByLabel(/^Email$/i).fill(employee.email);
    await employeePage.getByLabel(/^Password$/i).fill(employee.password);
    await employeePage.getByRole("button", { name: /Sign in/i }).click();
    await employeePage.waitForURL((url) => url.pathname.startsWith("/employee") && !url.pathname.includes("login"), {
      timeout: 25_000,
    });

    await employeePage.goto("/employee/schedule");
    const assignmentRow = employeePage.locator("li").filter({ hasText: uniqueTitle });
    await expect(assignmentRow).toBeVisible({ timeout: 15000 });
    await assignmentRow.getByRole("button", { name: /^Confirm$/i }).click();
    await expect(assignmentRow.getByText(/CONFIRMED/i)).toBeVisible({ timeout: 15000 });

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 90);
    const endIso = endDate.toISOString().slice(0, 10);
    const timeOffStart = endDate.toISOString().slice(0, 10);
    const timeOffEndDate = new Date(endDate);
    timeOffEndDate.setDate(timeOffEndDate.getDate() + 1);
    const timeOffEnd = timeOffEndDate.toISOString().slice(0, 10);
    await employeePage.goto("/employee/time-off");
    await employeePage.locator('input[name="startDate"]').fill(timeOffStart);
    await employeePage.locator('input[name="endDate"]').fill(timeOffEnd);
    await employeePage.locator('textarea[name="reason"]').fill("Playwright preview QA");
    await employeePage.getByRole("button", { name: /Submit request/i }).click();
    await expect(employeePage.getByText(/PENDING/i).first()).toBeVisible({ timeout: 15000 });

    await employeePage.goto("/employee/notices");
    await expect(employeePage.getByRole("heading", { name: /Notices/i })).toBeVisible();

    await page.goto("/admin/time-off");
    await expect(page.getByRole("heading", { name: /Time off requests/i })).toBeVisible();
    const pending = page.locator("li").filter({ hasText: "Preview QA Employee" }).filter({ hasText: /PENDING/i });
    await pending.first().getByRole("button", { name: /^Approve$/i }).click();
    await expect(pending.first().getByText(/APPROVED/i)).toBeVisible({ timeout: 15000 });

    await employeeContext.close();
  });
});
