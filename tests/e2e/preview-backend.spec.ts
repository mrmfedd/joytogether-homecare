import { test, expect } from "@playwright/test";

const previewOnly = !!process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app");

test.describe("preview backend smoke", () => {
  test.skip(!previewOnly, "Requires PLAYWRIGHT_BASE_URL pointing at Vercel preview");

  test("database health connected", async ({ request }) => {
    const res = await request.get("/api/health/db");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.database).toBe("connected");
  });

  test("consultation lead persists", async ({ request }) => {
    const idem = `pw-${Date.now()}`;
    const res = await request.post("/api/consultation", {
      data: {
        fullName: "Playwright Preview Lead",
        email: "playwright-preview@example.com",
        phone: "8135550111",
        careType: "companionship",
        location: "Tampa",
        message: "Automated preview lead",
        consent: true,
        website: "",
        idempotencyKey: idem,
      },
      headers: { "idempotency-key": idem },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.leadId).toBeTruthy();
  });

  test("admin accept-invite route loads", async ({ page }) => {
    await page.goto("/admin/accept-invite?token=invalid");
    await expect(page.locator("body")).toBeVisible();
  });
});
