import { test, expect } from "@playwright/test";
import { generateSync } from "otplib";
import { existsSync, readFileSync } from "fs";

const previewOnly = !!process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app");
const adminPath = "/tmp/jt-preview-env/qa-admin.json";
const employeePath = "/tmp/jt-preview-env/qa-employee.json";

test.describe.configure({ mode: "serial" });

async function mfaAdminLogin(page: import("@playwright/test").Page) {
  const qa = JSON.parse(readFileSync(adminPath, "utf8")) as {
    email: string;
    password: string;
    mfaSecret: string;
  };
  const code = generateSync({ secret: qa.mfaSecret });
  await page.goto("/admin/login");
  await page.getByLabel(/^Email$/i).fill(qa.email);
  await page.getByLabel(/^Password$/i).fill(qa.password);
  await page.getByLabel(/Authenticator code/i).fill(code);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await expect(page).toHaveURL(/\/admin(?:\/(?!login)|$)/, { timeout: 20000 });
}

async function employeeLogin(page: import("@playwright/test").Page) {
  const qa = JSON.parse(readFileSync(employeePath, "utf8")) as { email: string; password: string };
  await page.context().clearCookies();
  await page.goto("/employee/login");
  await page.getByLabel(/^Email$/i).fill(qa.email);
  await page.getByLabel(/^Password$/i).fill(qa.password);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/employee") && !url.pathname.includes("login"), {
    timeout: 25_000,
  });
}

test.describe("preview portal authorization", () => {
  test.skip(
    !previewOnly || !existsSync(adminPath) || !existsSync(employeePath),
    "Requires preview URL + qa-admin.json + qa-employee.json",
  );

  test("employee session cannot access admin routes", async ({ page }) => {
    await employeeLogin(page);
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/employee/, { timeout: 15000 });
  });

  test("admin session cannot access employee routes", async ({ page }) => {
    await mfaAdminLogin(page);
    await page.goto("/employee/schedule");
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
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
