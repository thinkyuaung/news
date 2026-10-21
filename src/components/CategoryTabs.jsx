import { useRef } from "react";

// Accessible tabs: screen readers announce them as tabs, and the
// arrow keys / Home / End move between them like a native tab control.
export default function CategoryTabs({ categories, activeId, onSelect }) {
  const tabRefs = useRef({});

  function handleKeyDown(event) {
    const index = categories.findIndex((c) => c.id === activeId);
    const moves = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: categories.length - 1,
    };
    if (!(event.key in moves)) return;

    event.preventDefault();
    // Wrap around: right from the last tab goes to the first.
    const next = categories[(moves[event.key] + categories.length) % categories.length];
    onSelect(next.id);
    tabRefs.current[next.id]?.focus();
  }

  return (
    <nav className="tabs" aria-label="News categories">
      <div className="tabs__list" role="tablist" onKeyDown={handleKeyDown}>
        {categories.map((category) => {
          const selected = category.id === activeId;
          return (
            <button
              key={category.id}
              id={`tab-${category.id}`}
              ref={(el) => (tabRefs.current[category.id] = el)}
              type="button"
              role="tab"
              className="tabs__tab"
              aria-selected={selected}
              aria-controls="news-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(category.id)}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
