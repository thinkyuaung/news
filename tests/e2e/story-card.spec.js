import { test, expect } from "@playwright/test";
import { mockApi } from "../helpers/mockApi.js";

// Uses tests/fixtures/edge-cases.json, a hand-made response with every tricky case.
// The clock is frozen so "x hours ago" is predictable.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-21T12:00:00Z"));
  await mockApi(page, { "/news": "edge-cases" });
  await page.goto("./");
  await expect(page.getByRole("article").first()).toBeVisible();
});

const card = (page, title) => page.getByRole("article").filter({ hasText: title });

test.describe("Story cards", () => {
  test("groups stories into the right sections", async ({ page }) => {
    // Ad slot skipped, untitled sections become/merge into "Top stories",
    // and sections with only duplicates or no stories are dropped.
    const headings = page.getByRole("heading", { level: 2 });
    await expect(headings).toHaveText(["Top stories", "Media"]);

    const topStories = page.getByRole("region", { name: "Top stories" });
    await expect(topStories.getByRole("article")).toHaveCount(3);
    await expect(page.getByRole("region", { name: "Media" }).getByRole("article")).toHaveCount(2);
  });

  test("skips stories without a title or a link, and duplicates", async ({ page }) => {
    await expect(page.getByRole("article")).toHaveCount(5);
    await expect(page.getByText("must be skipped")).toHaveCount(0);
    await expect(card(page, "Edge article with relative path")).toHaveCount(1);
  });

  test("turns relative paths into full bbc.com links and keeps absolute urls", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "Edge article with relative path" }),
    ).toHaveAttribute("href", "https://www.bbc.com/news/articles/edge-article");
    await expect(
      page.getByRole("link", { name: "Edge live page with absolute url and future date" }),
    ).toHaveAttribute("href", "https://www.bbc.com/news/live/edge-live");
  });

  test("story links open safely in a new tab", async ({ page }) => {
    for (const link of await page.locator(".card__link").all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("clicking anywhere on a card opens the article", async ({ page }) => {
    const popupPromise = page.waitForEvent("popup");
    // Click the top-left corner of the card (over the image), not the title text.
    await card(page, "Edge video clip").click({ position: { x: 10, y: 10 } });
    const popup = await popupPromise;
    expect(popup.url()).toBe("https://www.bbc.com/news/videos/edge-video");
  });

  test("shows LIVE, VIDEO and AUDIO badges, and none on articles", async ({ page }) => {
    await expect(card(page, "Edge live page").locator(".card__badge")).toHaveText("LIVE");
    await expect(card(page, "Edge video clip").locator(".card__badge")).toHaveText("VIDEO");
    await expect(card(page, "Edge audio clip").locator(".card__badge")).toHaveText("AUDIO");
    await expect(card(page, "Edge article with relative path").locator(".card__badge")).toHaveCount(
      0,
    );
  });

  test("shows images with alt text, and placeholders when missing or broken", async ({ page }) => {
    await expect(card(page, "Edge article with relative path").getByRole("img")).toHaveAttribute(
      "alt",
      "Alt text for the edge article",
    );
    await expect(card(page, "Edge story without an image").locator("img")).toHaveCount(0);
    await expect(
      card(page, "Edge story without an image").locator(".card__image--placeholder"),
    ).toBeVisible();
    // broken-image.jpg returns 404 from the mock, so the card falls back to a placeholder.
    await expect(card(page, "Edge audio clip").locator("img")).toHaveCount(0);
    await expect(card(page, "Edge audio clip").locator(".card__image--placeholder")).toBeVisible();
  });

  test("shows time ago and read time, and hides bad values", async ({ page }) => {
    await expect(card(page, "Edge article with relative path").locator(".card__meta")).toHaveText(
      "2 hours ago · 4 min read",
    );
    await expect(card(page, "Edge video clip").locator(".card__meta")).toHaveText("Just now");
    await expect(card(page, "Edge audio clip").locator(".card__meta")).toHaveText("45 min ago");
    // readTime 0 must not show "0 min read" (or a stray "0").
    await expect(card(page, "Edge story without an image").locator(".card__meta")).toHaveText(
      "2 days ago",
    );
    // A future date (common on live pages) shows no time at all.
    await expect(card(page, "Edge live page").locator(".card__meta")).toHaveCount(0);
  });

  test("hides the summary when it is empty", async ({ page }) => {
    await expect(card(page, "Edge video clip").locator(".card__summary")).toHaveCount(0);
  });
});
