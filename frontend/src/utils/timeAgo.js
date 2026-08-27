/**
 * Formats a given timestamp into a human-readable relative time string:
 * - "Just now" (< 1 min)
 * - "1 min ago", "10 mins ago", "15 mins ago", "29 mins ago"
 * - "1 hour ago", "2 hours ago"
 * - "1 day ago", "56 days ago"
 * - "1 year ago", "2 years ago"
 *
 * @param {string|number|Date} timestamp
 * @param {number|Date} [now=Date.now()]
 * @returns {string}
 */
export function formatTimeAgo(timestamp, now = Date.now()) {
  if (!timestamp) return 'Just now';

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const time = date.getTime();
  if (isNaN(time)) return 'Just now';

  const currentTime = typeof now === 'number' ? now : (now instanceof Date ? now.getTime() : new Date(now).getTime());
  const diffMs = currentTime - time;

  // If reported in the future or under 60 seconds ago
  if (diffMs < 60000) {
    return 'Just now';
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 365) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}
