# BBC News Reader

A **learning project**: a one-page React app that shows BBC headlines by category. It's built with Vite, tested with Playwright and hosted on GitHub Pages.

The person working on this is learning web development, so:

- Explain _what_ you changed and _why_ in plain language after every change.
- Prefer simple, readable code over clever code. Add short comments where a beginner would get stuck.
- Don't add new dependencies, a router, TypeScript or a state library unless the user asks.

## Tech and constraints

- **React 19 + Vite 8**, plain JavaScript (`.js` / `.jsx`).
- **GitHub Pages** serves the built `dist/` folder from `/news/`, so `base` in `vite.config.js` must match the repo name. Import assets through Vite; never hard-code `/`-rooted paths.
- **No router.** Tabs switch with React state, which avoids 404s on refresh (Pages has no server).
- **Static hosting only:** no server and no secrets. The API needs no key.

## File structure

```
src/
  main.jsx               starts React
  App.jsx                active tab state + page layout (loading / error / empty / success)
  categories.js          CATEGORIES list: { id, label, path }
  api/fetchPage.js       network only: friendly errors, AbortSignal support
  api/parse.js           raw BBC JSON → [{ id, title, stories[] }]: the ONLY file that knows the BBC data shape
  hooks/useNews.js       fetch + parse + status, cancels stale requests, retry()
  utils/timeAgo.js       ISO date → "5 min ago"
  components/            Header, CategoryTabs, Section, StoryCard, Loading, ErrorMessage, Footer
  styles.css             design tokens + light/dark themes, responsive grid
tests/
  e2e/*.spec.js          Playwright tests (mocked API)
  e2e/live.smoke.spec.js the only test that hits the real API
  helpers/mockApi.js     route mocking: fixtures, errors, delays, per-call sequences
  fixtures/              news.json and world.json (real responses), edge-cases.json (hand-made)
```

Data flow: **click tab → App (state) → useNews → fetchPage → BBC API → parse → Section/StoryCard → screen**.
Keep these layers separate. Components never touch raw BBC JSON.

## The BBC API

- Endpoint: `https://web-cdn.api.bbci.co.uk/xd/page/content?path=<path>`
- No auth, HTTPS, CORS `*`, caches for about 30s. **Unofficial and undocumented**, so it can change without warning.
- Response shape and the quirks `parse.js` handles:
  ```
  content.content[]                 sections; type "advertisement" = ad slot, skip
    .model.title                    "" → continuation of the section above, merge
    .model.contents.data[]          stories; the same story can appear in several sections, dedupe by id
       .title, .summary
       .path (relative → prefix "https://www.bbc.com") OR .url (absolute)
       .type                        article | video | live | audio | link | customCard
       .indexImage.model.blocks     { src, altText } (may be missing)
       .lastPublishedAt             live pages can have FUTURE dates
       .readTime                    may be 0 or missing
  ```
- Errors: 404 returns `{"error":"Content not found"}`. Some paths return 200 with no stories.

## Categories

Checked 2026-10-21. Re-check with the `news-categories` skill. `src/categories.js` is the source of truth.

| Works                                                                                                                      | Empty (200, no stories) | 404                                      |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------- |
| /news, /news/world, /news/uk, /news/us-canada, /news/world/{asia,europe}, /business, /innovation, /culture, /travel, /arts | /sport, /sport/football | /news/business, /news/technology, /earth |

## Commands

```
npm run dev            dev server with hot reload (http://localhost:5173/news/)
npm run build          production build → dist/
npm run preview        serve the built site
npm run format         prettier --write .
npm run format:check   prettier --check .
npm test               Playwright: chromium + mobile projects, mocked API
npm run test:ui        Playwright UI mode
npm run test:live      smoke tests against the REAL API (not in CI)
node .claude/skills/news-categories/check-categories.mjs   live category check
```

## Testing rules

- Every new feature or bug fix gets a Playwright test. Run `npm test` before saying a task is done.
- Mock the API with `mockApi()`. Only `live.smoke.spec.js` may touch the real network.
- Put tricky data cases in `tests/fixtures/edge-cases.json`.
- Use role-based locators (`getByRole`) and web-first assertions. Freeze time with `page.clock` for dates.
- Never skip or weaken a test to make it pass.

## Formatting (Claude Code hooks in `.claude/settings.json`)

- **PostToolUse**: every file Claude edits or writes is auto-formatted with Prettier (`.claude/hooks/post-prettier-format.mjs`).
- **PreToolUse**: `git commit` is blocked if any file fails `prettier --check` (`.claude/hooks/pre-prettier-check.mjs`). Fix it with `npm run format`. Never bypass the hook.
- `tests/fixtures/` is excluded from Prettier (`.prettierignore`) so recorded responses stay exactly as received.

## Rules for content

- Show headlines, summaries and thumbnails only. Always link to the full article on bbc.com (`target="_blank" rel="noopener noreferrer"`).
- Keep the footer note: "Unofficial learning project. Not affiliated with the BBC. Content © BBC." Don't use BBC logos.
- Render API text as normal JSX text. Never use `dangerouslySetInnerHTML` with API strings.

## Deploy

`.github/workflows/deploy.yml`: on push to `main` it runs format check → Playwright → build → deploy to Pages. Any failure stops the deploy.
One-time setup: GitHub repo → Settings → Pages → Source: **GitHub Actions**.

## Roadmap

- **v1 (done):** tabs, sections, story cards (image, badge, time ago, read time), loading / error / retry / empty states, keyboard-accessible tabs, responsive layout, dark mode (follows the system setting), tests, CI deploy.
- **v2:** search filter, dark mode toggle, remember last tab (`localStorage`), refresh button and "updated X min ago", tab stored in the URL hash (`#world`), Vitest unit tests for `parse.js`.

## Project agents and skills

- **senior-qa** agent: risk analysis, coverage gaps, writes missing Playwright tests, QA report with Go / No-Go. Reports bugs and doesn't fix app code. Use it after finishing a feature.
- `/explain-code [file|function|concept]`: beginner-friendly walkthrough with an exercise.
- `/explain-demo [audience, length]`: pre-flight check, demo script, backup plan and likely questions.
- `/news-categories`: live check of which category paths work, plus how to add a tab.
