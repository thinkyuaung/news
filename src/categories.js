// The category tabs shown at the top of the page.
// Check that every path still works with: node .claude/skills/news-categories/check-categories.mjs
// That script and live.smoke.spec.js read this list directly; the e2e tests list the tabs
// on purpose, so adding a tab means updating home.spec.js and tabs.spec.js too.
export const CATEGORIES = [
  { id: "news", label: "Top News", path: "/news" },
  { id: "world", label: "World", path: "/news/world" },
  { id: "uk", label: "UK", path: "/news/uk" },
  { id: "us-canada", label: "US & Canada", path: "/news/us-canada" },
  { id: "asia", label: "Asia", path: "/news/world/asia" },
  { id: "europe", label: "Europe", path: "/news/world/europe" },
  { id: "business", label: "Business", path: "/business" },
  { id: "innovation", label: "Innovation", path: "/innovation" },
  { id: "culture", label: "Culture", path: "/culture" },
  { id: "travel", label: "Travel", path: "/travel" },
  { id: "arts", label: "Arts", path: "/arts" },
];
