// Runs in the "mobile" project only (Pixel 7 viewport), see playwright.config.js.
import { test, expect } from "@playwright/test";
import { mockApi } from "../helpers/mockApi.js";

test.beforeEach(async ({ page }) => {
  await mockApi(page, { "/news": "news", "/arts": "world" });
  await page.goto("./");
  await expect(page.getByRole("article").first()).toBeVisible();
});

test.describe("Mobile layout", () => {
  test("the page never scrolls sideways", async ({ page }) => {
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("story cards stack in a single column", async ({ page }) => {
    const boxes = await Promise.all(
      (await page.getByRole("article").all()).slice(0, 4).map((a) => a.boundingBox()),
    );
    const lefts = new Set(boxes.map((b) => Math.round(b.x)));
    expect(lefts.size).toBe(1);
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y);
  });

  test("the last tab can be reached by scrolling the tab bar", async ({ page }) => {
    const arts = page.getByRole("tab", { name: "Arts" });
    await arts.click(); // Playwright scrolls it into view first, like a user swiping
    await expect(arts).toHaveAttribute("aria-selected", "true");
    await expect(arts).toBeInViewport();
  });

  test("tabs stay visible at the top while scrolling", async ({ page }) => {
    await page.getByRole("article").last().scrollIntoViewIfNeeded();
    await expect(page.getByRole("tablist")).toBeInViewport();
  });
});
