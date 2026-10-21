/** Turns an ISO date into "5 min ago", "3 hours ago", "2 days ago". */
export function timeAgo(isoDate, now = Date.now()) {
  const time = Date.parse(isoDate);
  // Missing, invalid or future dates (live pages sometimes have these) show nothing.
  if (Number.isNaN(time) || time > now) return "";

  const minutes = Math.floor((now - time) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
