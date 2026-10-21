---
name: news-categories
description: Show which BBC news categories (API paths) currently work, how many stories each returns, and how to add a new category tab. Use when the user asks "what categories are there", "show news categories", "does /xyz work", or wants to add/remove a tab.
---

# News categories

The BBC API takes a `path` and returns that section's stories:
`https://web-cdn.api.bbci.co.uk/xd/page/content?path=<path>`

The API is unofficial, so which paths work can change. **Never answer from memory. Run the check.**

## 1. Run the live check

From the project root:

```bash
node .claude/skills/news-categories/check-categories.mjs
```

To test extra paths the user asks about, add them **without the leading slash** (Git Bash on Windows rewrites `/sport` into a file path):

```bash
node .claude/skills/news-categories/check-categories.mjs sport news/science_and_environment
```

The output has one row per path: status, number of sections, number of stories, and a sample headline. `OK` means the path is usable as a tab.

## 2. Report back

Show the user a short table with the columns: Tab label · Path · Works? · Stories.

- Use friendly tab labels (`/news/world/asia` → "Asia").
- Call out paths that return **200 but 0 stories** (for example `/sport`). They look fine but would show the empty message.
- Call out 404s as "not available".

## 3. Adding or removing a category (only if asked)

1. Confirm the path is `OK` with the script above.
2. Add or remove it in `CATEGORIES` in `src/categories.js` (`{ id, label, path }`, where `id` is a short unique slug).
3. Nothing to change in `check-categories.mjs`: it reads `src/categories.js` directly.
4. Update the tests that count tabs or list every path: `tests/e2e/home.spec.js` (`toHaveCount(11)`) and the path list in `tests/e2e/tabs.spec.js` ("every tab requests its own API path").
5. Update the category table in `CLAUDE.md`.
6. Run `npm test` and `npm run test:live`.
7. Explain the change to the user in one or two sentences. This is a learning project.

## Known results (last checked 2026-10-21)

- **Works:** /news, /news/world, /news/uk, /news/us-canada, /news/world/asia, /news/world/europe, /business, /innovation, /culture, /travel, /arts
- **Empty (200, 0 stories):** /sport, /sport/football
- **404:** /news/business, /news/technology, /earth

This list is only a hint. Re-run the script before relying on it.
