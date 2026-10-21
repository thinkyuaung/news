import { useCallback, useEffect, useState } from "react";
import { fetchPage } from "../api/fetchPage.js";
import { parsePage } from "../api/parse.js";

/**
 * Loads one BBC category and tracks its state.
 * status: "loading" | "success" | "empty" | "error"
 */
export function useNews(path) {
  const [state, setState] = useState({ status: "loading", sections: [], error: null });
  // Bumping this number re-runs the effect below, which is how "Retry" works.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Cancel this request if the user switches tabs before it finishes,
    // so an old, slow response can't overwrite the new tab's stories.
    const controller = new AbortController();
    setState({ status: "loading", sections: [], error: null });

    fetchPage(path, { signal: controller.signal })
      .then((json) => {
        const sections = parsePage(json);
        setState({ status: sections.length ? "success" : "empty", sections, error: null });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", sections: [], error: error.message });
      });

    return () => controller.abort();
  }, [path, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
