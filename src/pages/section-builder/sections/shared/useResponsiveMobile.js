import { useEffect, useState } from 'react';

const QUERY = '(max-width: 639px)'; // matches Tailwind's `sm` breakpoint (640px)

/**
 * Resolves whether "mobile" styling should apply, for sections/blocks with a
 * mobile/desktop field pair (columns_mobile, cards_visible_mobile, …).
 *
 * Canvas.jsx's own inner "page frame" is *always* a fixed-width `<div>`
 * (390/768/1280/1600px, or `fit`) regardless of who renders it — the
 * interactive builder canvas, PreviewLive.jsx, or ThemePreview.jsx — never
 * an actual narrow browser viewport, so CSS media queries like `sm:` always
 * evaluate against the real (typically much wider) window and never reflect
 * the selected device. Canvas.jsx therefore always passes the toggle's real
 * value down as `explicitIsMobile`, for every caller including read-only
 * ones; when that's given, it wins outright. The `window.matchMedia`
 * fallback below exists only for the genuine published-storefront render
 * path (a real, full browser viewport, no builder frame) and for tests —
 * anything going through Canvas.jsx should never hit it.
 */
const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export function useResponsiveMobile(explicitIsMobile) {
  const [matches, setMatches] = useState(() => (canMatchMedia() ? window.matchMedia(QUERY).matches : false));

  useEffect(() => {
    if (explicitIsMobile !== undefined || !canMatchMedia()) return undefined;
    const mql = window.matchMedia(QUERY);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [explicitIsMobile]);

  return explicitIsMobile !== undefined ? explicitIsMobile : matches;
}
