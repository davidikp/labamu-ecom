/**
 * @module online-store/timeUtils
 * @description Tiny relative-time formatter for the Online Store > Themes
 * gallery and Pages/Files tables ("Last saved: 5 mins ago"). Split into its
 * own module (rather than living in ThemeGalleryCards.jsx) purely so that
 * file can stay component-only for React Fast Refresh. Units are kept short
 * ("min"/"hr") so the value fits compact table columns like Pages' Updated.
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hr${diffHour === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

/**
 * Absolute date + time, e.g. "Sep 3, 2026, 3:45 PM" — for Files' "Date
 * Added" column, where a relative "245 days ago" isn't precise enough.
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
