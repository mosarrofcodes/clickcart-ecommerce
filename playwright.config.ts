import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  expect: {
    timeout: 15_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    // Poll the DB-backed health probe (not just "/") so Neon's scale-to-zero
    // cold resume happens here, within Playwright's 120s webServer timeout,
    // rather than during the first test's 15s assertion window.
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      // Keep Neon's compute warm for the whole E2E session (mid-suite cart
      // clear / order POST calls must not stall on another cold resume).
      DATABASE_KEEPALIVE_MS: "30000",
    },
  },
});