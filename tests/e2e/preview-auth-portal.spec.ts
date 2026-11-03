import { test, expect } from "@playwright/test";
import { existsSync } from "fs";
import {
  employeeLogin,
  mfaAdminLogin,
  previewReady,
  readJson,
  type MfaCreds,
} from "./helpers/preview-auth";

const adminPath = "/tmp/jt-preview-env/qa-admin.json";
const employeePath = "/tmp/jt-preview-env/qa-employee.json";

test.describe.configure({ mode: "serial" });

test.describe("preview portal authorization", () => {
  test.skip(
    !previewReady() || !existsSync(adminPath) || !existsSync(employeePath),
    "Requires preview URL + qa-admin.json + qa-employee.json",
  );

  test("employee session cannot access admin routes", async ({ page }) => {
    await employeeLogin(page, readJson("qa-employee.json"));
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/employee/, { timeout: 15_000 });
  });

  test("admin session cannot access employee routes", async ({ page }) => {
    await mfaAdminLogin(page, readJson<MfaCreds>("qa-admin.json"));
    await page.goto("/employee/schedule");
    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
  });

  test("staff login hub links reach correct login pages", async ({ page }) => {
    await page.goto("/staff-login");
    await page.getByRole("link", { name: /Sign in as administrator/i }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/staff-login");
    await page.getByRole("link", { name: /Sign in as employee/i }).click();
    await expect(page).toHaveURL(/\/employee\/login$/);
  });
});
