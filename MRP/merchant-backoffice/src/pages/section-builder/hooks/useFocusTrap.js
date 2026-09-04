import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * US-10.4 — traps Tab focus inside an open modal/panel and returns it to the
 * trigger on close, per WAI-ARIA dialog pattern. Also fires `onEscape` for
 * Esc-to-close. Attach the returned ref to the dialog's outermost element.
 */
export function useFocusTrap(active, onEscape) {
  const containerRef = useRef(null);
  const triggerElementRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    triggerElementRef.current = document.activeElement;
    const container = containerRef.current;
    const focusables = container?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [];
    (focusables[0] ?? container)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      if (e.key !== 'Tab' || !container) return;

      const nodes = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerElementRef.current?.focus?.();
    };
  }, [active, onEscape]);

  return containerRef;
}
