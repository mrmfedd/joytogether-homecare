import { test, expect, devices } from "@playwright/test";

const headline = /Joy Together Homecare: In-Home Care Services in Tampa, FL/i;

test.describe("homepage Google reviews carousel", () => {
  test("shows reviews section with visible quotes", async ({ page }) => {
    await page.goto("/#home-reviews-heading", { waitUntil: "domcontentloaded" });
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await expect(section.getByRole("heading", { name: headline })).toBeVisible();
    const firstQuote = section.locator("article[aria-roledescription='slide'] p.leading-relaxed").first();
    await expect(firstQuote).toContainText(/\u201c|"/);
    await expect(section.getByRole("button", { name: "Next review" })).toBeVisible();
  });

  test("advances reviews without horizontal page overflow", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await section.scrollIntoViewIfNeeded();
    const cards = section.locator("article[aria-roledescription='slide']");
    const cardCount = await cards.count();
    test.skip(cardCount === 0, "No review cards rendered");

    const before = (await cards.first().innerText()).trim();
    await section.getByRole("button", { name: "Next review" }).click();
    if (cardCount > 1) {
      const after = (await cards.first().innerText()).trim();
      expect(after).not.toBe(before);
    }

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keyboard navigation moves slides when multiple reviews exist", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await section.scrollIntoViewIfNeeded();
    const cards = section.locator("article[aria-roledescription='slide']");
    const cardCount = await cards.count();
    test.skip(cardCount < 2, "Need at least two reviews to verify keyboard advance");

    const before = (await cards.first().innerText()).trim();
    await section.focus();
    await page.keyboard.press("ArrowRight");
    const after = (await cards.first().innerText()).trim();
    expect(after).not.toBe(before);
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

  test("tablet shows up to two review cards", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPad Mini"] });
    const page = await context.newPage();
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='home-reviews-heading']");
    await section.scrollIntoViewIfNeeded();
    const cards = section.locator("article[aria-roledescription='slide']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(2);
    await context.close();
  });
});
