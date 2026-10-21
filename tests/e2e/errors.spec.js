import { test, expect } from "@playwright/test";
import { mockApi, firstStoryTitle } from "../helpers/mockApi.js";

test.describe("Errors and empty states", () => {
  test("server error shows a message, and Retry recovers", async ({ page }) => {
    const requests = await mockApi(page, { "/news": [{ status: 500 }, "news"] });
    await page.goto("./");

    const alert = page.getByRole("alert");
    await expect(alert).toContainText("Something went wrong");
    await expect(alert).toContainText("status 500");

    await alert.getByRole("button", { name: "Retry" }).click();

    await expect(alert).toBeHidden();
    await expect(page.getByRole("article").first()).toContainText(firstStoryTitle("news"));
    expect(requests).toEqual(["/news", "/news"]);
  });

  test("404 shows the error message", async ({ page }) => {
    await mockApi(page, { "/news": { status: 404, json: { error: "Content not found" } } });
    await page.goto("./");

    await expect(page.getByRole("alert")).toContainText("status 404");
  });

  test("network failure (offline or blocked) shows a friendly message", async ({ page }) => {
    await mockApi(page, { "/news": { abort: true } });
    await page.goto("./");

    await expect(page.getByRole("alert")).toContainText("Could not reach the BBC");
  });

  test("invalid JSON shows a friendly message, not a technical error", async ({ page }) => {
    await mockApi(page, { "/news": { body: "<html>Oops</html>" } });
    await page.goto("./");

    const alert = page.getByRole("alert");
    await expect(alert).toContainText("couldn't read");
    await expect(alert).not.toContainText("SyntaxError");
    await expect(alert).not.toContainText("Unexpected token");
  });

  test("a category with no stories shows an empty message", async ({ page }) => {
    // This is what /sport really returns: 200 OK with no sections.
    await mockApi(page, {
      "/news": { json: { type: "page", content: { type: "indexPage", content: [] } } },
    });
    await page.goto("./");

    await expect(page.getByText("No Top News stories right now")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("an unexpected data shape shows the empty message instead of crashing", async ({ page }) => {
    await mockApi(page, { "/news": { json: { something: "completely different" } } });
    await page.goto("./");

    await expect(page.getByText("No Top News stories right now")).toBeVisible();
  });

  test("switching to another tab after an error recovers", async ({ page }) => {
    await mockApi(page, { "/news": { status: 500 }, "/news/world": "world" });
    await page.goto("./");
    await expect(page.getByRole("alert")).toBeVisible();

    await page.getByRole("tab", { name: "World" }).click();

    await expect(page.getByRole("alert")).toBeHidden();
    await expect(page.getByRole("article").first()).toContainText(firstStoryTitle("world"));
  });

  test("no uncaught errors in the browser console", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await mockApi(page, { "/news": "news", "/news/world": { status: 500 } });
    await page.goto("./");
    await expect(page.getByRole("article").first()).toBeVisible();
    await page.getByRole("tab", { name: "World" }).click();
    await expect(page.getByRole("alert")).toBeVisible();

    expect(errors).toEqual([]);
  });
});
