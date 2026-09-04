import AddBlockControl from './AddBlockControl';

/**
 * A thin strip that inserts a new block at one specific position within a
 * stream's children — the Easyblocks-style "+" positioned at a boundary next
 * to the currently *selected* block (see BlockStream.jsx's `insertBetween`
 * gating — this component itself is only ever rendered when that's true, so
 * it doesn't need its own visibility logic beyond positioning).
 *
 * `className` supplies this instance's positioning; each call site anchors
 * it differently (the leading edge of a block via BlockBoundary, or the
 * stream's trailing edge via BlockStream).
 *
 * `sectionType` must be forwarded through to AddBlockControl — it's how
 * AddBlockControl resolves its type list (`blockTypesForSection`) whenever
 * `types` isn't explicitly given (i.e. every section-level stream, which
 * doesn't pass `addTypes`; only group streams do). Omitting it silently
 * empties the type list, which breaks both the click-to-add and the
 * popover-menu paths — see BlockStream.jsx's callers.
 */
export default function InsertZone({ className, types, sectionType, onInsert }) {
  return (
    <div className={'z-30 flex items-center justify-center ' + className}>
      <AddBlockControl sectionType={sectionType} types={types} atMax={false} onAdd={onInsert} variant="insert" />
    </div>
  );
}
