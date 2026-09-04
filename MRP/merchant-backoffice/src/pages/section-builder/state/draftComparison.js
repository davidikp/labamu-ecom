/**
 * @module section-builder/state/draftComparison
 * @description US-1.4/US-8.3's real "has unpublished changes" check —
 * replaces Phase 1's `canUndo` stand-in. Only compares the content that
 * actually gets published: pages, theme, header, footer. `selection` and
 * `mediaLibrary` are deliberately excluded — they're not publishable content.
 */
const CONTENT_KEYS = ['pages', 'theme', 'header', 'footer'];

function contentOf(snapshot) {
  if (!snapshot) return null;
  return Object.fromEntries(CONTENT_KEYS.map((key) => [key, snapshot[key]]));
}

export function hasUnpublishedChanges(current, published) {
  if (!published) return Boolean(current);
  return JSON.stringify(contentOf(current)) !== JSON.stringify(contentOf(published));
}
