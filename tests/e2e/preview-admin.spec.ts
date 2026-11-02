import { test, expect } from "@playwright/test";
import { generateSync } from "otplib";
import { readFileSync, existsSync } from "fs";

const previewOnly = !!process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app");
const qaPath = "/tmp/jt-preview-env/qa-admin.json";

test.describe("preview admin workflows", () => {
  test.skip(!previewOnly || !existsSync(qaPath), "Requires preview URL + local QA credentials file");

  const qa = JSON.parse(readFileSync(qaPath, "utf8")) as {
    email: string;
    password: string;
    mfaSecret: string;
  };

  test("login with MFA reaches admin dashboard", async ({ page }) => {
    const code = generateSync({ secret: qa.mfaSecret });
    await page.goto("/admin/login");
    await page.getByLabel(/^Email$/i).fill(qa.email);
    await page.getByLabel(/^Password$/i).fill(qa.password);
    await page.getByLabel(/Authenticator code/i).fill(code);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText(/dashboard|leads|consultations/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("unauthenticated resume download is denied", async ({ request }) => {
    const res = await request.get("/api/admin/applications/d395d05e-6cc0-494b-950b-a2d0c6b15c4c/resume");
    expect([401, 403]).toContain(res.status());
  });

  test("authenticated resume download succeeds for recruiter", async ({ page, request }) => {
    const code = generateSync({ secret: qa.mfaSecret });
    await page.goto("/admin/login");
    await page.getByLabel(/^Email$/i).fill(qa.email);
    await page.getByLabel(/^Password$/i).fill(qa.password);
    await page.getByLabel(/Authenticator code/i).fill(code);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await request.get("/api/admin/applications/d395d05e-6cc0-494b-950b-a2d0c6b15c4c/resume", {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/pdf|octet-stream/i);
  });
});
