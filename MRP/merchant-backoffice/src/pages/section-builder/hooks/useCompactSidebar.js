import { useEffect, useState } from 'react';

const QUERY = '(max-width: 1279px)';

/**
 * True below 1280px — sidebar collapses to an icon-only rail (US-1.3).
 */
export function useCompactSidebar() {
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (e) => setIsCompact(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isCompact;
}
