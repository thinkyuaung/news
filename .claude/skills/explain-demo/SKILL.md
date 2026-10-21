---
name: explain-demo
description: Prepare a demo walkthrough of the BBC News Reader for presenting to others, with a pre-flight check, a run-through script, talking points, DevTools and test moments, and a backup plan if the API is down. Use when the user says "demo", "present", "show this to my team or trainer", "explain the demo", or invokes /explain-demo.
argument-hint: "[optional: audience and length, e.g. 'trainer, 5 min' or 'team, 10 min']"
---

# Explain and prepare a demo

Help the user **present** this project. Produce a demo script they can follow, and check that the demo will actually work.

Audience and length come from `$ARGUMENTS`. The default is **trainer/classmates, 5 minutes**. Non-technical audiences get less code and more of the app. Technical audiences get more code and tests.

## Step 1: Pre-flight check (do this, don't just describe it)

1. Live categories, so the demo doesn't hit an empty tab:
   `node .claude/skills/news-categories/check-categories.mjs`
2. Tests and formatting pass:
   `npm run format:check` and `npm test`
3. The build works: `npm run build`
4. Find the live URL: `git remote -v` → `https://<user>.github.io/bbc-news-reader/`. If there's no remote, the demo runs locally with `npm run build && npm run preview` (http://localhost:4173/bbc-news-reader/).
5. Report anything broken **before** writing the script.

## Step 2: Write the demo script

Use this structure, with times scaled to the requested length:

| #   | Section                    | Time    | What to show and say                                                                                                                                                                                                 |
| --- | -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Intro**                  | 30s     | "A news reader built with React and Vite, tested with Playwright, deployed automatically to GitHub Pages, using the BBC's public web API." Mention it's a learning project.                                          |
| 2   | **Live app**               | 1–2 min | Click 2–3 tabs that worked in the pre-flight check. Point out the cards, the LIVE/VIDEO/AUDIO badges, "x min ago", and links opening on bbc.com. Use the arrow keys on the tabs. Shrink the window for mobile.       |
| 3   | **Under the hood**         | 1–2 min | DevTools → Network: click a tab, show the request to `web-cdn.api.bbci.co.uk` and its JSON. No API key, and CORS allows it.                                                                                          |
| 4   | **Code tour**              | 1–2 min | Show the flow (diagram in the `explain-code` skill). One short snippet each from `fetchPage.js`, `parse.js` (the quirks it handles) and `useNews.js` (cancelling stale requests). Quote real code with line numbers. |
| 5   | **Error handling**         | 30s     | DevTools → Network → "Offline", click a tab, show the friendly error, go back online, click Retry.                                                                                                                   |
| 6   | **Quality**                | 1 min   | Run `npm run test:ui` and play one test (e.g. the tab race-condition test). Mention the mocked API, the edge-case fixture, the Prettier hooks and CI blocking a broken deploy.                                       |
| 7   | **Lessons and next steps** | 30s     | What was learned, the limits (unofficial API, BBC content rights, sport is empty), and the v2 ideas from `CLAUDE.md`.                                                                                                |

For each section, give:

- **Do:** the exact clicks, keys and commands
- **Say:** 1–3 sentences the user can say out loud (first person, natural, not robotic)

## Step 3: Backup plan

Always include this:

- **If the API is down or slow:** run `npm test`, because the tests use saved responses and still pass. Or show `tests/fixtures/news.json`.
- **If GitHub Pages is down:** `npm run build && npm run preview`.
- **If a tab is empty:** "The BBC's sport feed doesn't come through this API, which is one of the risks of an unofficial API. The app shows a friendly empty message instead of breaking."

## Step 4: Likely questions

List 4–6 questions the audience might ask, each with a short answer, based on the real code. For example:

- _Why React and not plain JS?_
- _Is this allowed? Whose content is it?_
- _What happens if the BBC changes the API?_ (Only `parse.js` changes, and `npm run test:live` warns us.)
- _Why mock the API in tests?_
- _How does it get to GitHub Pages?_ (The GitHub Actions workflow.)
- _What is CORS?_

## Rules

- Base everything on the **actual** repo and the pre-flight results, not the plan.
- Keep the script skimmable: tables and bullets, no long paragraphs.
- Don't change project files. If something needs fixing before the demo, list it and ask.
