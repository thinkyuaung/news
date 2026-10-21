import { useState } from "react";
import { CATEGORIES } from "./categories.js";
import { useNews } from "./hooks/useNews.js";
import Header from "./components/Header.jsx";
import CategoryTabs from "./components/CategoryTabs.jsx";
import Section from "./components/Section.jsx";
import Loading from "./components/Loading.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const category = CATEGORIES.find((c) => c.id === activeId);
  const { status, sections, error, retry } = useNews(category.path);

  return (
    <div className="app">
      <Header />
      <CategoryTabs categories={CATEGORIES} activeId={activeId} onSelect={setActiveId} />

      <main
        id="news-panel"
        className="content"
        role="tabpanel"
        aria-labelledby={`tab-${activeId}`}
        aria-busy={status === "loading"}
      >
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorMessage message={error} onRetry={retry} />}
        {status === "empty" && (
          <p className="empty">No {category.label} stories right now. Try another category.</p>
        )}
        {status === "success" &&
          sections.map((section) => <Section key={section.id} section={section} />)}
      </main>

      <Footer />
    </div>
  );
}
