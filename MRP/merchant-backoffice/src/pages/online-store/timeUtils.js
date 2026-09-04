/**
 * @module online-store/timeUtils
 * @description Tiny relative-time formatter for the Online Store > Themes
 * gallery ("Last saved: 5 minutes ago"). Split into its own module (rather
 * than living in ThemeGalleryCards.jsx) purely so that file can stay
 * component-only for React Fast Refresh.
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}
