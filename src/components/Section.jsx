import StoryCard from "./StoryCard.jsx";

export default function Section({ section }) {
  const headingId = `heading-${section.id}`;

  return (
    <section className="section" aria-labelledby={headingId}>
      <h2 id={headingId} className="section__title">
        {section.title}
      </h2>
      <div className="section__grid">
        {section.stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
