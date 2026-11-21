import { test, expect } from "@playwright/test";

test.describe("patient care coordination (unauthenticated)", () => {
  test("admin patients route requires login", async ({ page }) => {
    await page.goto("/admin/patients");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("employee my patients requires login", async ({ page }) => {
    await page.goto("/employee/patients");
    await expect(page).toHaveURL(/\/employee\/login/);
  });

  test("employee cannot hit admin patient API surface", async ({ request }) => {
    const res = await request.get("/admin/patients/new");
    expect(res.status()).toBeGreaterThanOrEqual(300);
  });
});