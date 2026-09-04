import { useEffect } from 'react';

/**
 * Fires the browser's native "leave site?" confirmation when there are
 * unpublished changes (US-1.4). Phase 7 will replace the `dirty` signal
 * (currently "any undo history exists") with a real draft-vs-published
 * comparison once publish/draft snapshots exist.
 */
export function useConfirmLeaveIfDirty(dirty) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
