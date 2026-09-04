import { useEffect } from 'react';

/**
 * Ctrl+Z / Cmd+Z to undo, Ctrl+Shift+Z / Cmd+Shift+Z to redo (US-7.1, US-7.2).
 * Global by design — the merchant should be able to undo from anywhere in
 * the builder, including while a section is selected. Known trade-off: this
 * takes priority over a focused rich-text field's native browser undo; since
 * text edits are coalesced into one step per field (US-7.4), that's rarely
 * the flow a merchant needs anyway.
 */
export function useUndoRedoShortcuts(undo, redo) {
  useEffect(() => {
    const handler = (e) => {
      const isModifierZ = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z';
      if (!isModifierZ) return;
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
}
