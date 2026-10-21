// Smoke tests against the REAL BBC API, with no mocks.
// They can fail when the BBC changes things; that's the point: they warn us early.
// Run with: npm run test:live
import { test, expect } from "@playwright/test";
import { CATEGORIES } from "../../src/categories.js";
import { API_URL } from "../../src/api/fetchPage.js";
import { parsePage } from "../../src/api/parse.js";

test.describe("Live BBC API", () => {
  for (const category of CATEGORIES) {
    test(`${category.label} (${category.path}) returns stories we can parse`, async ({
      request,
    }) => {
      const response = await request.get(`${API_URL}?path=${encodeURIComponent(category.path)}`);
      expect(response.status()).toBe(200);

      const sections = parsePage(await response.json());
      expect(sections.length).toBeGreaterThan(0);

      const story = sections[0].stories[0];
      expect(story.title).toBeTruthy();
      expect(story.link).toMatch(/^https:\/\//);
    });
  }

  test("the real site loads stories in the browser", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("article").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
