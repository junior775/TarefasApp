import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:8081",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx expo start --web --port 8081",
    url: "http://127.0.0.1:8081",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
