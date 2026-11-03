import { expect, type Page } from "@playwright/test";
import { generateSync } from "otplib";
import { existsSync, readFileSync } from "fs";

export const QA_DIR = "/tmp/jt-preview-env";

export type MfaCreds = { email: string; password: string; mfaSecret: string };
export type PasswordCreds = { email: string; password: string };

export function previewReady(): boolean {
  return !!process.env.PLAYWRIGHT_BASE_URL?.includes("vercel.app");
}

export function readJson<T>(name: string): T {
  const path = `${QA_DIR}/${name}`;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function qaFilesPresent(): boolean {
  return (
    existsSync(`${QA_DIR}/qa-admin.json`) &&
    existsSync(`${QA_DIR}/qa-operator.json`) &&
    existsSync(`${QA_DIR}/qa-viewer.json`) &&
    existsSync(`${QA_DIR}/qa-employee.json`)
  );
}

export async function mfaAdminLogin(page: Page, creds: MfaCreds) {
  await page.context().clearCookies();
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = generateSync({ secret: creds.mfaSecret });
    await page.goto("/admin/login");
    await page.getByLabel(/^Email$/i).fill(creds.email);
    await page.getByLabel(/^Password$/i).fill(creds.password);
    await page.getByLabel(/Authenticator code/i).fill(code);
    await page.getByRole("button", { name: /Sign in/i }).click();
    try {
      await expect(page).toHaveURL(/\/admin(?:\/(?!login)|$)/, { timeout: 12_000 });
      return;
    } catch (e) {
      lastError = e;
      await page.waitForTimeout(800);
    }
  }
  throw lastError;
}

export async function passwordAdminLogin(page: Page, creds: PasswordCreds) {
  await page.goto("/admin/login");
  await page.getByLabel(/^Email$/i).fill(creds.email);
  await page.getByLabel(/^Password$/i).fill(creds.password);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await expect(page).toHaveURL(/\/admin(?:\/(?!login)|$)/, { timeout: 25_000 });
}

export async function employeeLogin(page: Page, creds: PasswordCreds) {
  await page.context().clearCookies();
  await page.goto("/employee/login");
  await page.getByLabel(/^Email$/i).fill(creds.email);
  await page.getByLabel(/^Password$/i).fill(creds.password);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/employee") && !url.pathname.includes("login"), {
    timeout: 25_000,
  });
}

export const REPORT_CATEGORIES = [
  "leads",
  "consultations",
  "private-duty",
  "employees",
  "shifts",
  "time-off",
  "timesheets",
] as const;

export function localDateTimeInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
