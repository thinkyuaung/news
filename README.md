# BBC News Reader

A learning project: a one-page React app that shows the latest BBC headlines by category.

**Live site:** https://thinkyuaung.github.io/news/

> Unofficial learning project. Not affiliated with the BBC. All news content © BBC. Every story links to the full article on bbc.com.

## Features

- 11 categories: Top News, World, UK, US & Canada, Asia, Europe, Business, Innovation, Culture, Travel, Arts
- Story cards with image, LIVE / VIDEO / AUDIO badge, "x min ago" and read time
- Loading, error with Retry, and empty states
- Keyboard-accessible tabs (← → Home End), screen-reader friendly
- Responsive layout, and dark mode that follows your system setting

## Tech

React 19 · Vite 8 · Playwright · Prettier · GitHub Actions · GitHub Pages

Data comes from the BBC's public (unofficial) web API, `https://web-cdn.api.bbci.co.uk/xd/page/content?path=/news`, which needs no key.

## Getting started

Requires Node.js 20.19+.

```bash
npm install
npx playwright install chromium   # first time only
npm run dev                       # http://localhost:5173/news/
```

## Scripts

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Dev server with hot reload                          |
| `npm run build`        | Production build into `dist/`                       |
| `npm run preview`      | Serve the production build locally                  |
| `npm run format`       | Format all files with Prettier                      |
| `npm run format:check` | Check formatting (used in CI)                       |
| `npm test`             | Playwright e2e tests, desktop + mobile, mocked API  |
| `npm run test:ui`      | Playwright UI mode, good for learning and debugging |
| `npm run test:live`    | Smoke tests against the real BBC API                |

## Project structure

```
src/
  api/fetchPage.js     network calls
  api/parse.js         BBC JSON → clean data (the only file that knows the BBC format)
  hooks/useNews.js     loading / error / data state for a category
  components/          Header, CategoryTabs, Section, StoryCard, Loading, ErrorMessage, Footer
  categories.js        the list of tabs
tests/
  e2e/                 Playwright specs
  helpers/mockApi.js   fakes the BBC API so tests are fast and stable
  fixtures/            saved API responses + hand-made edge cases
.github/workflows/     test + deploy pipeline
.claude/               Claude Code hooks, Senior QA agent, skills
```

## Deploying to GitHub Pages

1. This project lives in the GitHub repo **`news`**, so the site is served from `/news/`. If you rename the repo, change `base` in `vite.config.js` and `BASE_URL` in `playwright.config.js` to match.
2. Push this project to the `main` branch.
3. In the repo: **Settings → Pages → Source: GitHub Actions**.
4. Every push to `main` now runs: format check → tests → build → deploy. If a step fails, the site isn't updated.

## Working with Claude Code

- **Hooks:** files Claude edits are auto-formatted with Prettier, and `git commit` is blocked if anything is unformatted.
- **Senior QA agent:** ask _"have the senior QA review this"_ for a risk analysis, new tests and a Go / No-Go report.
- **Skills:** `/explain-code`, `/explain-demo`, `/news-categories`.
