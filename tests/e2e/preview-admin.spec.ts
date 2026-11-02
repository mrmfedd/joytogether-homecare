import { test, expect } from "@playwright/test";
import { generateSync } from "otplib";
import { createHash, randomBytes } from "crypto";
import { readFileSync, existsSync } from "fs";
import pg from "pg";

const previewOnly = !!process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app");
const qaPath = "/tmp/jt-preview-env/qa-admin.json";

test.describe.configure({ mode: "serial" });

test.describe("preview admin workflows", () => {
  test.skip(!previewOnly || !existsSync(qaPath), "Requires preview URL + local QA credentials file");

  test("MFA login, resume ACL, consultations, and password reset", async ({ page }) => {
    const qa = JSON.parse(readFileSync(qaPath, "utf8")) as {
      email: string;
      password: string;
      mfaSecret: string;
    };

    // Unauthenticated resume denied
    const denied = await page.request.get("/api/admin/applications/d395d05e-6cc0-494b-950b-a2d0c6b15c4c/resume");
    expect([401, 403]).toContain(denied.status());

    // Single MFA login for remaining checks (avoids in-memory rate limits)
    const code = generateSync({ secret: qa.mfaSecret });
    await page.goto("/admin/login");
    await page.getByLabel(/^Email$/i).fill(qa.email);
    await page.getByLabel(/^Password$/i).fill(qa.password);
    await page.getByLabel(/Authenticator code/i).fill(code);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/\/admin(?:\/(?!login)|$)/, { timeout: 20000 });
    await expect(page.getByText(/dashboard|leads|consultations/i).first()).toBeVisible({ timeout: 15000 });

    const allowed = await page.request.get("/api/admin/applications/d395d05e-6cc0-494b-950b-a2d0c6b15c4c/resume");
    expect(allowed.status()).toBe(200);
    expect(allowed.headers()["content-type"]).toMatch(/pdf|octet-stream/i);

    await page.goto("/admin/consultations");
    await expect(page.getByText(/SCHEDULED|Scheduled/i).first()).toBeVisible({ timeout: 15000 });

    if (!process.env.DATABASE_URL) return;

    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    const user = await pool.query(`select id from "User" where email=$1`, [qa.email]);
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await pool.query(
      `insert into "PasswordResetToken" (id, "userId", "tokenHash", "expiresAt") values (gen_random_uuid()::text, $1, $2, now() + interval '1 hour')`,
      [user.rows[0].id, tokenHash],
    );
    await pool.end();

    await page.goto(`/admin/reset-password?token=${token}`);
    await expect(page.getByRole("heading", { name: /Choose a new password/i })).toBeVisible();
  });
});
