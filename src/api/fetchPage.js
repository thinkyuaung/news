// Network layer: the only file that calls the BBC API.
// It returns the raw JSON and leaves it to parse.js to make sense of it.

export const API_URL = "https://web-cdn.api.bbci.co.uk/xd/page/content";

/**
 * Fetch one BBC page (e.g. "/news/world") as raw JSON.
 * `signal` lets the caller cancel the request, e.g. when the user switches tabs quickly.
 */
export async function fetchPage(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}?path=${encodeURIComponent(path)}`, { signal });
  } catch (error) {
    // Pass cancellations through unchanged so the caller can ignore them.
    if (error.name === "AbortError") throw error;
    // fetch() only throws when the request never got a response (offline, blocked, DNS...).
    throw new Error(
      "Could not reach the BBC. Check your internet connection or ad blocker, then try again.",
    );
  }

  if (!response.ok) {
    throw new Error(`The BBC returned an error (status ${response.status}). Please try again.`);
  }

  try {
    return await response.json();
  } catch {
    // The response wasn't valid JSON, e.g. an HTML error page.
    throw new Error("The BBC sent data we couldn't read. Please try again.");
  }
}
