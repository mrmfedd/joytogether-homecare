import { test, expect } from "@playwright/test";

test.describe("staff login hub", () => {
  test("staff login page shows both portals", async ({ page }) => {
    await page.goto("/staff-login");
    await expect(page.getByRole("heading", { name: "Staff Login", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign in as administrator/i })).toHaveAttribute(
      "href",
      "/admin/login"
    );
    await expect(page.getByRole("link", { name: /Sign in as employee/i })).toHaveAttribute(
      "href",
      "/employee/login"
    );
  });

  test("header and footer link to staff login", async ({ page }) => {
    await page.goto("/");
    const headerLink = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", {
      name: "Staff Login",
    });
    await expect(headerLink).toBeVisible();
    await headerLink.click();
    await expect(page).toHaveURL(/\/staff-login$/);

    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: "Staff Login" }).click();
    await expect(page).toHaveURL(/\/staff-login$/);
  });

  test("admin and employee login pages expose forgot password", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("link", { name: /Forgot password/i })).toHaveAttribute(
      "href",
      "/admin/forgot-password"
    );
    await page.goto("/employee/login");
    await expect(page.getByRole("link", { name: /Forgot password/i })).toHaveAttribute(
      "href",
      "/employee/forgot-password"
    );
  });

  test("staff login layout on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/staff-login");
    await expect(page.getByRole("heading", { name: "Administrator Login", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Employee Login", level: 2 })).toBeVisible();
    const cards = page.locator("a.card-soft");
    await expect(cards).toHaveCount(2);
    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    expect(box1 && box2).toBeTruthy();
    if (box1 && box2) {
      expect(box2.y).toBeGreaterThan(box1.y);
    }
  });
});
