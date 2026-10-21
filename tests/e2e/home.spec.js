import { test, expect } from "@playwright/test";
import { mockApi, firstStoryTitle } from "../helpers/mockApi.js";

test.describe("Home page", () => {
  test("shows the header, tabs and Top News selected", async ({ page }) => {
    await mockApi(page);
    await page.goto("./");

    await expect(page).toHaveTitle("BBC News Reader");
    await expect(page.getByRole("heading", { level: 1, name: "News Reader" })).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(11);
    await expect(page.getByRole("tab", { name: "Top News" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("loads Top News stories from the API", async ({ page }) => {
    const requests = await mockApi(page);
    await page.goto("./");

    await expect(page.getByRole("heading", { level: 2, name: "Top stories" })).toBeVisible();
    await expect(page.getByRole("article").first()).toContainText(firstStoryTitle("news"));
    expect(await page.getByRole("article").count()).toBeGreaterThan(10);
    expect(requests).toEqual(["/news"]);
  });

  test("shows each story only once", async ({ page }) => {
    await mockApi(page);
    await page.goto("./");
    await expect(page.getByRole("article").first()).toBeVisible();

    const links = await page.locator(".card__link").evaluateAll((els) => els.map((a) => a.href));
    expect(new Set(links).size).toBe(links.length);
  });

  test("shows a loading indicator while stories load", async ({ page }) => {
    await mockApi(page, { "/news": { fixture: "news", delay: 1000 } });
    await page.goto("./");

    const loading = page.getByRole("status");
    await expect(loading).toHaveText("Loading stories…");
    await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-busy", "true");

    await expect(page.getByRole("article").first()).toBeVisible();
    await expect(loading).toBeHidden();
    await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-busy", "false");
  });

  test("shows the unofficial-project disclaimer in the footer", async ({ page }) => {
    await mockApi(page);
    await page.goto("./");

    await expect(page.getByRole("contentinfo")).toContainText("Not affiliated with the BBC");
  });
});
