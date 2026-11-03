import { test, expect } from "@playwright/test";

test.describe("employee portal smoke", () => {
  test("employee login page loads", async ({ page }) => {
    await page.goto("/employee/login");
    await expect(page.getByRole("heading", { name: /Employee Portal/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
  });

  test("admin scheduling requires auth or loads for signed-in admin", async ({ page }) => {
    const res = await page.goto("/admin/scheduling");
    expect(res?.status()).toBeLessThan(500);
    const url = page.url();
    const onLogin = url.includes("/admin/login");
    const onScheduling = url.includes("/admin/scheduling");
    expect(onLogin || onScheduling).toBe(true);
  });
});
