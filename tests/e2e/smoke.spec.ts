import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /JoyTogether Admin/i })).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /Let's Talk About Your Care Needs/i })).toBeVisible();
  });

  test("services page loads", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: /Care Pathways/i })).toBeVisible();
  });
});
