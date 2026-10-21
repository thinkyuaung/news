import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
// Same sub-path as GitHub Pages (see `base` in vite.config.js).
const BASE_URL = `http://localhost:${PORT}/news/`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // fail CI if someone left a `test.only` behind
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/live\.smoke/, /responsive/],
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: [/responsive/, /home/],
    },
    {
      // Hits the REAL BBC API. Run on demand with `npm run test:live`, never in CI.
      name: "live",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /live\.smoke/,
    },
  ],

  // Build the production site and serve it, exactly like GitHub Pages would.
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
