---
name: explain-code
description: Explain this project's code to a beginner, a file, component, hook, test or concept at a time, with a walkthrough, the JavaScript/React concepts used, and a small exercise. Use when the user says "explain", "how does X work", "what does this file do", "walk me through", or invokes /explain-code with a file or function name.
argument-hint: "[file, function or concept, e.g. src/api/parse.js, useNews, StoryCard, 'how tabs work', 'how the tests mock the API']"
---

# Explain code

The user is **learning** web development with this project. Help them understand the code. Don't just describe it.

## What to explain

- **If arguments were given** (`$ARGUMENTS`), explain that file, function, component or concept.
- **If the user has code selected in the editor**, explain the selection.
- **If nothing was given**, give the big-picture tour (section 3) and ask what to go deeper on.

Always **read the actual file first**. Never explain from memory or from the plan, because the code may have changed.

## 1. Format for a file, component or function

Use these sections, in this order, and keep each one short:

1. **In one sentence:** what it does and why it exists.
2. **Where it fits:** which layer it belongs to (see the flow below) and what uses it or what it uses.
3. **Step by step:** walk through the code in small chunks. Quote 3–10 lines at a time with the file and line number (`src/api/parse.js:42`), then explain them in plain words. Skip imports and boilerplate.
4. **Concepts used:** list the ideas that appear, each with a one-line explanation. Common ones here:
   - JS: `async/await`, `fetch`, `try/catch`, optional chaining `?.`, `??`, `Array.map/filter`, `Set`, template literals, `AbortController`
   - React: components and props, JSX, `useState`, `useEffect` (and its cleanup function), `useCallback`, `useRef`, `key`, conditional rendering (`&&`)
   - CSS: custom properties (variables), grid with `auto-fill/minmax`, `position: sticky`, the stretched-link `::after` trick, `prefers-color-scheme`
   - Accessibility: `role`, `aria-selected`, `aria-busy`, `role="alert"` / `"status"`, roving `tabIndex`
   - Playwright: `page.route` mocking, `getByRole`, `expect(...).toBeVisible()`, `page.clock`, projects
5. **What could go wrong:** how this code handles errors or missing data, or doesn't, and which test covers it (`tests/e2e/...spec.js:line`).
6. **Try it yourself:** one small, safe exercise, such as a value to change in `npm run dev` and watch, a test to run with `npm run test:ui`, or a tiny feature. Give the expected result.

## 2. The data flow (use this to explain "where it fits")

```
user clicks tab ─► App.jsx (activeId state) ─► useNews(path) ─► fetchPage(path) ─► BBC API (JSON)
                                                                                         │
     screen ◄── Section.jsx / StoryCard.jsx ◄── sections state ◄── parsePage(json) ◄─────┘
```

- **fetchPage.js**: talks to the network only, and turns failures into friendly messages.
- **parse.js**: the only file that knows the BBC JSON shape. If the BBC changes their data, only this file changes.
- **useNews.js**: a custom hook that ties fetch + parse to React state (loading / success / empty / error) and cancels stale requests.
- **components/**: turn clean data into HTML. They know nothing about the BBC.
- **App.jsx**: holds which tab is active and chooses what to show for each status.
- **tests/**: Playwright drives a real browser, with `mockApi.js` faking the BBC API.

## 3. Big-picture tour (no argument given)

1. Show the flow diagram above.
2. List each file with its one-sentence job, read from the actual repo.
3. Follow one click from start to finish: "You click **World** → `setActiveId('world')` → … → cards appear."
4. Suggest a reading order: `categories.js` → `api/fetchPage.js` → `api/parse.js` → `hooks/useNews.js` → `App.jsx` → `components/StoryCard.jsx` → `styles.css` → `tests/helpers/mockApi.js` → `tests/e2e/tabs.spec.js`.

## Style rules

- Write for a beginner. Define every term the first time it appears.
- Use analogies sparingly, and only when they really help.
- Show real code from the repo, not invented examples. If a general example is needed, label it "general example".
- Do **not** edit any files while explaining. If you spot a bug, mention it at the end and ask whether to fix it (or suggest running the `senior-qa` agent).
- End by offering 2–3 follow-ups, e.g. "Want me to explain `useNews.js` next, or try the exercise together?"
