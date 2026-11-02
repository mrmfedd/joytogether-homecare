import { test, expect, devices } from "@playwright/test";

const headline = /Joy Together Homecare: In-Home Care Services in Tampa, FL/i;

test.describe("homepage Google reviews carousel", () => {
  test("shows reviews section with fallback content", async ({ page }) => {
    await page.goto("/#home-reviews-heading", { waitUntil: "domcontentloaded" });
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await expect(section.getByRole("heading", { name: headline })).toBeVisible();
    await expect(section.getByText(/Thanks again! Gretha did a great job!!/i)).toBeVisible();
    await expect(section.getByRole("button", { name: "Next review" })).toBeVisible();
  });

  test("advances reviews without horizontal page overflow", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Next review" }).click();
    await expect(section.getByText(/Thank you\. My caregiver was amazing/i)).toBeVisible();
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keyboard navigation moves slides", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await section.scrollIntoViewIfNeeded();
    await section.focus();
    await page.keyboard.press("ArrowRight");
    await expect(section.getByText(/Thank you\. My caregiver was amazing/i)).toBeVisible();
  });

  test("mobile shows one primary review card", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await context.newPage();
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await section.scrollIntoViewIfNeeded();
    const cards = section.locator("article[aria-roledescription='slide']");
    await expect(cards).toHaveCount(1);
    await context.close();
  });

  test("tablet shows two review cards", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPad Mini"] });
    const page = await context.newPage();
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await section.scrollIntoViewIfNeeded();
    const cards = section.locator("article[aria-roledescription='slide']");
    await expect(cards).toHaveCount(2);
    await context.close();
  });
});
