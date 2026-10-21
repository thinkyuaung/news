import { test, expect } from "@playwright/test";
import { mockApi, firstStoryTitle } from "../helpers/mockApi.js";

test.describe("Category tabs", () => {
  test("clicking a tab loads that category", async ({ page }) => {
    const requests = await mockApi(page, { "/news": "news", "/news/world": "world" });
    await page.goto("./");
    await expect(page.getByRole("article").first()).toContainText(firstStoryTitle("news"));

    await page.getByRole("tab", { name: "World" }).click();

    await expect(page.getByRole("tab", { name: "World" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Top News" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(page.getByRole("article").first()).toContainText(firstStoryTitle("world"));
    await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "tab-world");
    expect(requests).toEqual(["/news", "/news/world"]);
  });

  test("every tab requests its own API path", async ({ page }) => {
    const paths = [
      "/news",
      "/news/world",
      "/news/uk",
      "/news/us-canada",
      "/news/world/asia",
      "/news/world/europe",
      "/business",
      "/innovation",
      "/culture",
      "/travel",
      "/arts",
    ];
    const requests = await mockApi(page, Object.fromEntries(paths.map((p) => [p, "news"])));
    await page.goto("./");

    for (const tab of await page.getByRole("tab").all()) {
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("article").first()).toBeVisible();
    }
    expect(new Set(requests)).toEqual(new Set(paths));
  });

  test("arrow keys, Home and End move between tabs", async ({ page }) => {
    await mockApi(page, { "/news": "news", "/news/world": "world", "/arts": "news" });
    await page.goto("./");

    const topNews = page.getByRole("tab", { name: "Top News" });
    const world = page.getByRole("tab", { name: "World" });
    const arts = page.getByRole("tab", { name: "Arts" });

    await topNews.focus();
    await page.keyboard.press("ArrowRight");
    await expect(world).toBeFocused();
    await expect(world).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("End");
    await expect(arts).toBeFocused();
    await expect(arts).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Home");
    await expect(topNews).toBeFocused();

    // Wraps around from the first tab to the last.
    await page.keyboard.press("ArrowLeft");
    await expect(arts).toBeFocused();
  });

  test("only the selected tab is in the Tab key order", async ({ page }) => {
    await mockApi(page);
    await page.goto("./");

    await expect(page.getByRole("tab", { name: "Top News" })).toHaveAttribute("tabindex", "0");
    await expect(page.getByRole("tab", { name: "World" })).toHaveAttribute("tabindex", "-1");
  });

  test("a slow response from an old tab never replaces the new tab's stories", async ({ page }) => {
    await mockApi(page, {
      "/news": "news",
      "/news/world": { fixture: "world", delay: 1500 }, // slow
      "/news/uk": "edge-cases", // fast
    });
    await page.goto("./");
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("tab", { name: "World" }).click();
    await page.getByRole("tab", { name: "UK" }).click();
    await expect(page.getByRole("article").first()).toContainText(firstStoryTitle("edge-cases"));

    // Wait past the slow World response, then make sure UK is still showing.
    await page.waitForTimeout(2000);
    await expect(page.getByRole("tab", { name: "UK" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("article").first()).toContainText(firstStoryTitle("edge-cases"));
    await expect(page.getByText(firstStoryTitle("world"))).toHaveCount(0);
  });
});
