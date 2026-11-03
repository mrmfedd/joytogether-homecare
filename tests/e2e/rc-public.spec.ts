import { test, expect, devices } from "@playwright/test";

const previewOnly = !!process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app");

test.describe("RC public site", () => {
  test.skip(!previewOnly, "Requires PLAYWRIGHT_BASE_URL preview");

  test("primary nav and consultation CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: /Joy Together Home Care home/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Free Consultation/i }).first()).toBeVisible();
    await page.getByRole("banner").getByRole("link", { name: /^Contact$/i }).click();
    await expect(page).toHaveURL(/contact/);
  });

  for (const slug of ["skilled-nursing", "hospice-care", "private-duty-care"] as const) {
    test(`service page ${slug}`, async ({ page }) => {
      await page.goto(`/services/${slug}`);
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      if (slug === "skilled-nursing") {
        await expect(h1).toContainText(/Clinical Care|Skilled Nursing|Comfort of Home/i);
      }
      if (slug === "hospice-care") {
        await expect(h1).toContainText(/Comfort|Dignity|Compassion|Hospice/i);
      }
      if (slug === "private-duty-care") {
        await expect(h1).toContainText(/Insurance|Options|Private/i);
      }
    });
  }

  test("mobile viewport home and services", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: /Care Pathways/i })).toBeVisible();
    await context.close();
  });

  test("tablet viewport contact form present", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPad Mini"] });
    const page = await context.newPage();
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /Let's Talk About Your Care Needs/i })).toBeVisible();
    await context.close();
  });
});
