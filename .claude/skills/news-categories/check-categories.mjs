// Checks which BBC category paths the API currently returns stories for.
// Usage: node check-categories.mjs [extra paths...]
//   e.g. node check-categories.mjs news/science_and_environment sport/tennis
// Leave off the leading "/" on Windows Git Bash, which rewrites "/sport" into a file path.

import { CATEGORIES } from "../../../src/categories.js";

const API = "https://web-cdn.api.bbci.co.uk/xd/page/content?path=";

// Always checks the app's real tabs, so this list can never drift out of sync.
const DEFAULT_PATHS = CATEGORIES.map((c) => c.path);

const extra = process.argv.slice(2).map((p) => "/" + p.replace(/^\/+/, ""));
const paths = [...DEFAULT_PATHS, ...extra];

async function check(path) {
  try {
    const res = await fetch(API + encodeURIComponent(path));
    if (!res.ok) return { path, status: res.status, sections: 0, stories: 0, sample: "" };

    const json = await res.json();
    const sections = (json?.content?.content ?? []).filter((s) => s?.model?.contents?.data?.length);
    const stories = sections.flatMap((s) => s.model.contents.data);
    return {
      path,
      status: res.status,
      sections: sections.length,
      stories: stories.length,
      sample: stories[0]?.title ?? "",
    };
  } catch (err) {
    return { path, status: "ERR", sections: 0, stories: 0, sample: err.message };
  }
}

const results = await Promise.all(paths.map(check));

console.log("Status  Sections  Stories  Path / sample headline");
for (const r of results) {
  const ok = r.status === 200 && r.stories > 0 ? "OK " : "-- ";
  console.log(
    `${ok}${String(r.status).padEnd(5)}${String(r.sections).padStart(6)}${String(r.stories).padStart(9)}    ${r.path}`,
  );
  if (r.sample) console.log(" ".repeat(28) + "↳ " + r.sample.slice(0, 70));
}

const usable = results.filter((r) => r.status === 200 && r.stories > 0).length;
console.log(`\n${usable}/${results.length} paths are usable as tabs.`);
