import InsertZone from './InsertZone';

/**
 * Wraps a single block's markup on the canvas so it can be individually
 * selected (Shopify-style). No-op passthrough when not in builder mode
 * (`onSelect` absent) so the live storefront renders the block untouched.
 *
 * `insertBefore` (optional — set only by BlockStream's `insertBetween` mode,
 * i.e. inside a group) renders a hover-revealed "+" strip at this block's
 * leading edge, absolutely positioned so it never affects the group's own
 * flex layout (gap/distribute/wrap) — see InsertZone.jsx.
 */
export default function BlockBoundary({ selected, onSelect, label, children, insertBefore }) {
  if (!onSelect) return children;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={'relative cursor-pointer ' + (selected ? 'z-10' : '')}
    >
      {insertBefore && (
        <InsertZone
          types={insertBefore.types}
          sectionType={insertBefore.sectionType}
          onInsert={insertBefore.onInsert}
          className={
            insertBefore.direction === 'horizontal'
              ? 'absolute inset-y-0 -left-2 w-4'
              : 'absolute inset-x-0 -top-2 h-4'
          }
        />
      )}
      {selected && (
        <>
          <div className="pointer-events-none absolute inset-0 z-20 border-2 border-blue-500" />
          {label && (
            <span className="absolute left-1 top-1 z-20 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {label}
            </span>
          )}
        </>
      )}
      {children}
    </div>
  );
}
