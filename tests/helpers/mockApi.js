// Test helper: intercepts every request to the BBC API and to BBC images, so the
// tests never touch the real network and always see the same data.
import { readFileSync } from "node:fs";

const API_PATTERN = "https://web-cdn.api.bbci.co.uk/xd/page/content**";
const IMAGE_PATTERN = "https://ichef.bbci.co.uk/**";
const ARTICLE_PATTERN = "https://www.bbc.com/**";

// A 1x1 grey PNG, served in place of every BBC image.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mOsrwcAAYEBAJ1bWb8AAAAASUVORK5CYII=",
  "base64",
);

export function loadFixture(name) {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), "utf8"));
}

/** Title of the first story in a fixture, read straight from the raw JSON. */
export function firstStoryTitle(name) {
  const sections = loadFixture(name).content.content;
  return sections.find((s) => s.model?.contents?.data?.length).model.contents.data[0].title;
}

async function respond(route, response) {
  if (typeof response === "string") response = { fixture: response };
  if (response.delay) await new Promise((resolve) => setTimeout(resolve, response.delay));
  if (response.abort) return route.abort("failed");

  return route.fulfill({
    status: response.status ?? 200,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body:
      response.body ??
      JSON.stringify(response.fixture ? loadFixture(response.fixture) : response.json),
  });
}

/**
 * Mock the BBC API for one test.
 *
 * `responses` maps an API path to what it should return:
 *   "news"                         -> tests/fixtures/news.json
 *   { status: 500 }                -> an HTTP error
 *   { abort: true }                -> a network failure (offline / blocked)
 *   { body: "not json" }           -> a raw response body
 *   { json: {...} }                -> inline JSON
 *   { fixture: "news", delay: 1500 } -> a slow response
 *   [first, second, ...]           -> a different answer per call (the last one repeats)
 *
 * Paths you don't list return 404. Returns `requests`, the list of paths the app asked for.
 */
export async function mockApi(page, responses = { "/news": "news" }) {
  const requests = [];

  await page.route(IMAGE_PATTERN, (route) => {
    if (route.request().url().includes("broken-image")) return route.fulfill({ status: 404 });
    return route.fulfill({ contentType: "image/png", body: TINY_PNG });
  });

  // Article links open in a new tab; give them a stub page instead of the real site.
  await page
    .context()
    .route(ARTICLE_PATTERN, (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>BBC stub</title>" }),
    );

  await page.route(API_PATTERN, (route) => {
    const path = new URL(route.request().url()).searchParams.get("path");
    const callIndex = requests.filter((p) => p === path).length;
    requests.push(path);

    let response = responses[path] ?? { status: 404, json: { error: "Content not found" } };
    if (Array.isArray(response)) response = response[Math.min(callIndex, response.length - 1)];

    return respond(route, response);
  });

  return requests;
}
