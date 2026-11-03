import { defineConfig } from "@playwright/test";

const remoteBase = process.env.PLAYWRIGHT_BASE_URL?.trim();
const useLocalServer = !remoteBase || remoteBase.includes("127.0.0.1") || remoteBase.includes("localhost");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: remoteBase?.includes("vercel.app") ? 1 : undefined,
  use: {
    baseURL: remoteBase || "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer:
    useLocalServer && !process.env.CI
      ? {
          command: "npm run start",
          port: 3000,
          reuseExistingServer: true,
        }
      : undefined,
});
