import { useEffect, useRef } from 'react';

/**
 * Inline, on-canvas text editing (Shopify-style "edit directly in the
 * content"). Renders a contentEditable element that mirrors `value` and
 * commits back through `onCommit` on blur / Enter. Escape reverts.
 *
 * Renderers opt in by rendering this instead of a plain text node whenever
 * they receive an `onEdit` callback (i.e. in builder mode). The commit is
 * debounced upstream by the field coalescer, so typing produces a single
 * undo entry — the same path used by the settings panel inputs.
 */
export default function EditableText({
  value,
  onCommit,
  as = 'span',
  className = '',
  style,
  placeholder = '',
  multiline = false,
  // Block Renderers pass their own block's `blockCtx.onSelect` here so that
  // clicking into the text to edit it also selects the containing block
  // (needed for BlockStream's insert-"+" affordance, which is gated on
  // block selection) — without this, the mousedown/click stopPropagation
  // below (needed to keep text-editing clicks from bubbling up to
  // section-level select/deselect) would also silently prevent block
  // selection, since it never reaches BlockBoundary's own onClick.
  onFocusSelect,
}) {
  const ref = useRef(null);
  const Tag = as;

  // Keep the DOM text in sync when the value changes from the outside
  // (undo/redo, settings panel edits) without clobbering the caret while
  // the user is actively typing in this node.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== (value ?? '')) {
      el.innerText = value ?? '';
    }
  }, [value]);

  const commit = () => {
    const next = ref.current?.innerText ?? '';
    if (next !== (value ?? '')) onCommit(next);
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder || undefined}
      data-sb-placeholder={placeholder || undefined}
      spellCheck={false}
      // Explicitly select the containing block first (if wired), then stop
      // the click from bubbling further — so it still reaches this block's
      // own select handler without also landing on section select / canvas
      // deselect above it.
      onMouseDown={(e) => {
        onFocusSelect?.();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (ref.current) ref.current.innerText = value ?? '';
          ref.current?.blur();
        } else if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          ref.current?.blur();
        }
      }}
      className={'sb-editable ' + className}
      style={style}
    >
      {value ?? ''}
    </Tag>
  );
}
