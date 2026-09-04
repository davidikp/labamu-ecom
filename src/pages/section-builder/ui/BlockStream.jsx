import BlockBoundary from './BlockBoundary';
import AddBlockControl from './AddBlockControl';
import InsertZone from './InsertZone';
import { blockDef } from '../sections/blocks/registry';

/**
 * Renders a section's (or group's) blocks in order, each via its registry
 * Renderer, wrapped in a selectable BlockBoundary with inline-edit wiring
 * (builder mode only). Container blocks (groups) receive a derived `childCtx`
 * so their nested BlockStream can select/edit/add their children.
 *
 * `sectionType` powers the Add-block type list; `addTypes` overrides it for a
 * group's allowed child types. `gated` (default true) only shows the on-canvas
 * Add control once a block is active — nested groups pass gated={false} so the
 * add control is always visible inside an open group.
 *
 * `insertBetween` (default on) swaps the single end-of-list Add button for
 * Easyblocks-style "+" affordances at the boundaries next to the currently
 * *selected* block (both above and below it) — each inserting at that exact
 * position instead of only appending. Selection-gated, not hover-gated: a
 * hover-reveal version was tried first and dropped — deciding visibility
 * from a `group-hover` CSS class fought with Canvas.jsx's own unrelated
 * `group` on the section wrapper (any hover in the section lit every strip
 * up), and even scoped to a named group the hover target itself was too
 * unreliable to hit. Selection is what the merchant already deliberately did
 * by clicking a block, so it's a precise, unambiguous signal instead of a
 * mouse position — every BlockStream call site gets this by default; pass
 * `insertBetween={false}` to opt a specific stream back out to the old
 * always-visible end-of-list button. `direction` orients the trailing strip
 * to match the stream's own layout — 'vertical' (the default) fits every
 * `flex flex-col` stream; the one horizontal exception
 * (product_carousel/Renderer.jsx's `flex ... overflow-x-auto` row) passes
 * `direction="horizontal"` explicitly, as does GroupBlock (whose direction
 * is itself data-driven, including a mobile override).
 */
export default function BlockStream({
  sectionType,
  addTypes,
  blocks = [],
  theme,
  mediaLibrary,
  blockCtx,
  className = 'flex flex-col gap-4',
  itemClassName,
  gated = true,
  hideAdd = false,
  isMobile,
  insertBetween = true,
  direction = 'vertical',
}) {
  const showAdd = !insertBetween && !hideAdd && blockCtx && !blockCtx.atMax && (!gated || blockCtx.selectedBlockId || blockCtx.sectionActive);
  const insertActive = insertBetween && !hideAdd && blockCtx && !blockCtx.atMax;
  const selectedIndex = insertActive ? blocks.findIndex((b) => b.id === blockCtx.selectedBlockId) : -1;
  const showTrailing = insertActive && blocks.length > 0 && selectedIndex === blocks.length - 1;
  // Absolutely positioned so it's excluded from this stream's own flex
  // layout entirely (same reasoning as the leading strips in
  // BlockBoundary.jsx) — and rendered as the LAST CHILD of the content div
  // below (not a sibling after it), anchored to that div's own `relative`
  // (added here, tightly around just the actual blocks). Anchoring it to
  // any ancestor further out is what caused it to land at the bottom of the
  // whole section instead of right under the selected block — e.g.
  // hero_banner's wrapper is stretched to the full section height by a
  // `justify-center` flex layout, so a sibling-of-BlockStream trailing zone
  // measured "bottom" against that full height, not the actual content.
  const trailingEdgeClass = direction === 'horizontal' ? 'absolute inset-y-0 -right-2 w-4' : 'absolute inset-x-0 -bottom-2 h-4';

  return (
    <>
      <div className={'relative ' + className}>
        {blocks.map((b, index) => {
          const def = blockDef(b.type);
          if (!def?.Renderer) return null;
          const Cmp = def.Renderer;

          // Derive a child context for container (group) blocks — recurses to
          // any nesting depth via blockCtx.childCtxFor, so a group nested
          // inside a group inside a group still gets working select/edit/add.
          const childCtx = def.container && blockCtx ? blockCtx.childCtxFor(b.id) : undefined;

          // The boundary immediately before this block only gets a "+" when
          // this block or its immediate predecessor is the selected one —
          // i.e. only the two strips touching the selection, not every gap.
          // `selectedIndex >= 0` guards the case where nothing in this
          // stream is selected (findIndex returns -1) — without it,
          // `index === selectedIndex + 1` is `index === 0` and every
          // stream's first block wrongly gets a "+" all the time.
          const showHere = insertActive && selectedIndex >= 0 && (index === selectedIndex || index === selectedIndex + 1);

          return (
            <BlockBoundary
              key={b.id}
              selected={blockCtx?.selectedBlockId === b.id}
              onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
              label={def.label}
              insertBefore={showHere ? { types: addTypes, sectionType, direction, onInsert: (type) => blockCtx.onAdd(type, index) } : undefined}
            >
              <div className={itemClassName}>
                <Cmp
                  block={b}
                  theme={theme}
                  mediaLibrary={mediaLibrary}
                  onEdit={blockCtx ? (key, value) => blockCtx.onEdit(b.id, key, value) : undefined}
                  onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
                  childCtx={childCtx}
                  isMobile={isMobile}
                />
              </div>
            </BlockBoundary>
          );
        })}

        {/* Trailing edge only when the LAST block is the selected one — a
            child of this same relative-positioned div (not a sibling after
            it), so "bottom" means the bottom of the actual content. */}
        {showTrailing && (
          <InsertZone types={addTypes} sectionType={sectionType} onInsert={(type) => blockCtx.onAdd(type, blocks.length)} className={trailingEdgeClass} />
        )}
      </div>

      {showAdd && (
        <AddBlockControl sectionType={sectionType} types={addTypes} atMax={blockCtx.atMax} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" />
      )}

      {/* Nothing selected yet to anchor a "+" near — an empty stream falls
          back to a normal, always-visible Add button. */}
      {insertActive && blocks.length === 0 && (
        <AddBlockControl sectionType={sectionType} types={addTypes} atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" />
      )}
    </>
  );
}
