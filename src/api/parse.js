// Parsing layer: the ONLY file that knows the shape of the BBC's JSON.
// If the BBC changes its data, this is the one file to update.
//
// Input (simplified):
//   content.content[]               -> sections, plus ad slots we skip
//     .type                         -> "collection" for news, "advertisement" for ads
//     .model.title                  -> heading, sometimes "" (a continuation of the section above)
//     .model.contents.data[]        -> stories
//
// Output:
//   [{ id, title, stories: [{ id, title, summary, link, image, imageAlt, type, badge, publishedAt, readTime }] }]

const BBC_SITE = "https://www.bbc.com";

// Story types that get a small label on the card. Plain articles get none.
const BADGES = { live: "LIVE", video: "VIDEO", audio: "AUDIO" };

export function parseStory(item) {
  // Links come as either a relative `path` ("/news/articles/...") or a full `url`.
  const link = item?.url ?? (item?.path ? BBC_SITE + item.path : null);

  // A story we can't show a title for, or can't link to, is useless, so skip it.
  if (!item?.title || !link) return null;

  const image = item.indexImage?.model?.blocks;

  return {
    id: item.id ?? link,
    title: item.title,
    summary: item.summary ?? "",
    link,
    image: image?.src ?? null,
    imageAlt: image?.altText ?? "",
    type: item.type ?? "article",
    badge: BADGES[item.type] ?? null,
    publishedAt: item.lastPublishedAt ?? item.firstPublishedAt ?? null,
    // Only keep a real positive number; React would print a stray "0" otherwise.
    readTime: item.readTime > 0 ? item.readTime : null,
  };
}

export function parsePage(json) {
  const rawSections = json?.content?.content;
  if (!Array.isArray(rawSections)) return [];

  const sections = [];
  const seenStoryIds = new Set(); // the same story often appears in several sections

  for (const raw of rawSections) {
    const items = raw?.model?.contents?.data;
    if (raw?.type !== "collection" || !Array.isArray(items)) continue;

    const stories = [];
    for (const item of items) {
      const story = parseStory(item);
      if (story && !seenStoryIds.has(story.id)) {
        seenStoryIds.add(story.id);
        stories.push(story);
      }
    }
    if (stories.length === 0) continue;

    const title = raw.model.title?.trim();
    const previous = sections.at(-1);

    if (!title && previous) {
      // An untitled section continues the one above it, so merge them.
      previous.stories.push(...stories);
    } else {
      sections.push({
        id: raw.model.collection?.id ?? `section-${sections.length}`,
        title: title || "Top stories",
        stories,
      });
    }
  }

  return sections;
}
