import { useState } from "react";
import { timeAgo } from "../utils/timeAgo.js";

export default function StoryCard({ story }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = story.image && !imageFailed;
  const published = timeAgo(story.publishedAt);

  return (
    <article className="card">
      <div className="card__media">
        {showImage ? (
          <img
            className="card__image"
            src={story.image}
            alt={story.imageAlt}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="card__image card__image--placeholder" aria-hidden="true" />
        )}
        {story.badge && (
          <span className={`card__badge card__badge--${story.type}`}>{story.badge}</span>
        )}
      </div>

      <div className="card__body">
        <h3 className="card__title">
          {/* The ::after on this link stretches it over the whole card, so the card is clickable. */}
          <a className="card__link" href={story.link} target="_blank" rel="noopener noreferrer">
            {story.title}
          </a>
        </h3>
        {story.summary && <p className="card__summary">{story.summary}</p>}

        {(published || story.readTime) && (
          <p className="card__meta">
            {published && <time dateTime={story.publishedAt}>{published}</time>}
            {published && story.readTime && <span aria-hidden="true"> · </span>}
            {story.readTime && <span>{story.readTime} min read</span>}
          </p>
        )}
      </div>
    </article>
  );
}
