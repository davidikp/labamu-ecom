import { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Plus, GripVertical, Pencil, ChevronDown, ChevronRight, Info, RotateCcw } from 'lucide-react';
import { Table, MainBtn, TextField, Popup, IconBtn, Tooltip } from '../../ce-ui';
import { loadOrSeedDemoDraft } from '../section-builder/state/demoBootstrap';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS, PROTECTED_MENU_IDS, DEFAULT_MENU_ITEMS } from '../section-builder/state/builderReducer';
import { slugify } from '../section-builder/sections/pageHelpers';
import PageLinkCombobox from '../section-builder/ui/fields/PageLinkCombobox';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { useSnackbar } from '../../contexts/SnackbarContext';
import SimulateTrigger from './SimulateTrigger';
import { THEME_ROSTER } from '../section-builder/themes/themeRoster';
import {
  MAX_DEPTH,
  INDENT_WIDTH,
  flattenTree,
  buildTree,
  removeChildrenOf,
  getProjection,
  moveItemAfter,
  updateNodeInTree,
  removeNodeFromTree,
  addChildToTree,
  validateTree,
} from './menuTree';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// PagesManagement.jsx/FilesManagement.jsx.
const STORE_ID = 'demo';
const MENU_NAME_MAX_LENGTH = 40;

/**
 * A horizontal insertion-point marker (circle + line), shown just above the
 * row currently being hovered over during a drag — the visual equivalent of
 * Shopify's own drop indicator, so the merchant sees exactly where (and at
 * what nesting depth) the dragged item will land before releasing it.
 */
function DropIndicatorLine({ depth }) {
  return (
    <div className="flex items-center py-1 pr-4" style={{ paddingLeft: 16 + depth * INDENT_WIDTH }} aria-hidden="true">
      <span className="h-2 w-2 shrink-0 rounded-full border-2 border-blue-500 bg-white" />
      <span className="h-[2px] flex-1 bg-blue-500" />
    </div>
  );
}

/**
 * One draggable, inline-editable row of the menu items tree — drag handle +
 * expand/collapse chevron + Label input + link combobox + delete, columns
 * matching the header row in MenuFormDrawer below exactly.
 *
 * Unlike RepeaterField.jsx/SectionListItem.jsx's flat `useSortable` rows,
 * this list is a tree (up to MAX_DEPTH levels) whose items can be dragged
 * both to reorder *and* to re-nest under a different parent — a shape
 * `@dnd-kit/sortable`'s SortableContext doesn't model. So this uses plain
 * `@dnd-kit/core` `useDraggable`/`useDroppable` instead (one flat DndContext
 * over every visible row, see MenuFormDrawer), with MenuFormDrawer computing
 * each row's live drag depth via menuTree.js's getProjection — the same
 * "flatten, project depth from horizontal drag distance, rebuild" recipe
 * dnd-kit's own sortable-tree example uses.
 */
function MenuItemRow({ item, pages, error, depth, nextDepth, isDragging, expanded, onToggleExpand, onChange, onRemove }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({ id: item.id });
  const { setNodeRef: setDropRef } = useDroppable({ id: item.id });
  const setNodeRef = (node) => {
    setDragRef(node);
    setDropRef(node);
  };
  const requiredText = t('sectionBuilder:onlineStore.menus.itemFieldRequired', 'Field cannot be empty');
  const childCount = item.children?.length ?? 0;
  // Items at MAX_DEPTH (grandchildren, when 3 levels are in play) can't have
  // children of their own — no chevron/expand affordance for them, just an
  // inert spacer so their Label/Link fields still line up with rows above.
  const canExpand = depth < MAX_DEPTH;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: isDragging ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
        zIndex: isDragging ? 10 : undefined,
      }}
      // `min-h` (not a fixed `h-[49px]`) + `items-start` — a row grows to fit
      // its inline error text (below) instead of clipping it; the drag
      // handle/delete button get a small top margin so they still align
      // with the fields' first line once the row is no longer a fixed
      // single-line height. Fixed `px-4` here (not depth-dependent) — only
      // the Label cluster below indents; the Link column and delete button
      // stay put so they line up with the header regardless of nesting.
      // `position: relative` is what the ancestor guide lines below anchor
      // to.
      className="flex min-h-[49px] items-start gap-2 border-b border-lb-line-1 bg-lb-surface px-4 py-2 last:border-b-0"
    >
      {/* One guide line per ancestor level, each aligned under that
          ancestor's own drag-handle column. The row's *immediate* parent
          level (the last one, `depth - 1`) gets a Shopify-style elbow — a
          horizontal tick running from that ancestor's column into this
          row's own drag handle — so the connection reads as "this row
          specifically" rather than just a generic vertical rule; levels
          further out (grandparent+) stay plain vertical rules. Every
          level's vertical segment stops at this row's own center instead of
          running its full height once this is the last row anywhere inside
          that ancestor's block (`nextDepth <= level`, i.e. whatever comes
          next has exited it) — otherwise the line would keep running past
          where that ancestor's children actually end. */}
      {Array.from({ length: depth }).map((_, level) => {
        const isImmediateParent = level === depth - 1;
        const isLastInBlock = nextDepth <= level;
        const x = 16 + level * INDENT_WIDTH + 10;
        // A `Fragment`, not a wrapping `<span>` — every direct child of this
        // row is a flex item, and a `<span>` here (even with only
        // absolutely-positioned children of its own, so *it* renders with
        // zero visible size) still counts as one, adding one extra `gap-2`
        // gap per ancestor level before the Label cluster below. That was
        // the real cause of the Link column creeping rightward with depth —
        // a Fragment renders no DOM node at all, so it can't.
        return (
          <Fragment key={level}>
            <span
              aria-hidden="true"
              className="absolute w-px bg-lb-line-2"
              style={{ left: x, top: 0, bottom: isLastInBlock ? 'calc(50% - 0.5px)' : 0 }}
            />
            {isImmediateParent && (
              <span
                aria-hidden="true"
                className="absolute h-px bg-lb-line-2"
                style={{ left: x, top: 'calc(50% - 0.5px)', width: 16 + depth * INDENT_WIDTH - x }}
              />
            )}
          </Fragment>
        );
      })}
      <div className="flex w-1/2 items-start gap-2" style={{ paddingLeft: depth * INDENT_WIDTH }}>
        <span
          aria-label={t('sectionBuilder:fields.repeaterField.dragToReorder', 'Drag to reorder')}
          className="mt-1.5 w-5 shrink-0 cursor-grab touch-none text-lb-on-surface-3 hover:text-lb-on-surface"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </span>
        {canExpand ? (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={
              expanded
                ? t('sectionBuilder:onlineStore.menus.collapseItem', 'Collapse')
                : t('sectionBuilder:onlineStore.menus.expandItem', 'Expand')
            }
            className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-lb-on-surface-3 hover:bg-lb-surface-2 hover:text-lb-on-surface"
          >
            {childCount > 0 ? (
              expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : (
              <span className="inline-block h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : (
          <span className="mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
        )}
        <div className="flex flex-1 flex-col gap-1">
          <input
            type="text"
            value={item.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder={t('sectionBuilder:onlineStore.menus.labelPlaceholder', 'e.g. About us')}
            className={`w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
              error?.label ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
            }`}
          />
          {error?.label && <p className="text-xs text-red-600">{requiredText}</p>}
        </div>
      </div>
      <div className="flex w-1/2 flex-col gap-1">
        <PageLinkCombobox
          value={item.url}
          onChange={(url) => onChange({ url })}
          pages={pages}
          placeholder={t('sectionBuilder:onlineStore.menus.linkSearchPlaceholder', 'Search or paste link')}
          className="w-full"
          error={Boolean(error?.url)}
        />
        {error?.url && <p className="text-xs text-red-600">{requiredText}</p>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('sectionBuilder:editor.common.delete', 'Delete')}
        className="mt-1 flex h-8 w-5 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/**
 * Menu form — a wide, centered ce-ui `Popup` (not a hand-built slide-in
 * panel). Investigation of demo-mrp's own "drawer" components (which this
 * screen was originally asked to match) showed they aren't true side panels
 * either: `GeneralModal` there is just the same vendored `Popup` given a
 * custom wide `width` via a CSS-var className override, wrapping ordinary
 * centered-modal content. So this follows that same pattern on top of this
 * codebase's own `Popup` (ce-ui/ui/popup.tsx) rather than inventing a
 * side-anchored layout `Popup` doesn't support: `platform="desktop"` for its
 * centered/scroll-body layout, widened past its default `w-[560px]` via the
 * `menu-form-popup` class (see index.css) — the same "static override class
 * + !important" trick demo-mrp's `.gm-modal-width` uses, since `cn()` here
 * is a plain string join (no tailwind-merge) so a later utility class in the
 * className string isn't guaranteed to win in the compiled stylesheet, and a
 * literal `w-[720px]` string can't be authored dynamically through Tailwind's
 * static class scanner anyway.
 *
 * `Popup` only supports a fixed primary/secondary action-button pair (see
 * popup.tsx), not arbitrary footer JSX, so the conditionally-shown Delete
 * button (left-aligned, separate from Cancel/Save) can't live in that row —
 * it's rendered as part of the Popup's own scrollable children instead,
 * pinned above the built-in Cancel/Save row via a top border, rather than
 * fighting Popup's footer API.
 *
 * One single form covers both "create a new menu" (empty name, no items)
 * and "edit an existing menu" (pre-filled) — Shopify's own menu editor
 * doesn't split naming a menu from populating it into two steps, and
 * there's no reason for this screen's mental model to add one. Mirrors the
 * label+url add/reorder/remove UX of RepeaterField.jsx's nav-link items,
 * but commits name+items together in one ACTIONS.SAVE_MENU action on Save
 * rather than dispatching per-edit — there's no live undo/redo history to
 * coalesce into outside the Section Builder itself (see runDraftAction.js).
 */
function MenuFormDrawer({ menu, isNew, pages, onSave, onClose }) {
  const { t } = useTranslation();
  // Save is faked as a brief network round-trip — a fixed 800ms spinner on
  // the primary button before onSave (which may itself fail/conflict, see
  // MenusManagement's handleSaveExisting/handleSaveNew) actually runs.
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(menu?.name ?? '');
  const [items, setItems] = useState(() => (menu?.items ?? []).map((item) => ({ ...item })));
  // Keyed by item id — `{ label: bool, url: bool }`. Once a row exists (added
  // via "Add menu item", or already present from a saved menu) both its
  // fields are mandatory: Save validates every row and surfaces inline
  // errors on whichever fields are still blank instead of persisting a menu
  // with empty label/link entries.
  const [itemErrors, setItemErrors] = useState({});
  // Save is never preemptively disabled (same "surface the error on click
  // instead" convention as PageEditor.jsx's own Title field) — this holds
  // the inline error text shown under Name once a blank Save attempt fires.
  const [nameError, setNameError] = useState(null);
  // Which items currently show their children — starts with every item that
  // already has children expanded, so editing an existing nested menu
  // doesn't open with its submenus hidden. Seeded from the full tree (not
  // just top-level items) since a saved menu can already be 3 levels deep.
  const [expandedIds, setExpandedIds] = useState(
    () => new Set(flattenTree(menu?.items ?? []).filter((item) => item.children?.length).map((item) => item.id))
  );
  // Drag state for the flattened tree drag-and-drop below — `activeId` is
  // the item being dragged, `overId` whichever row it's currently hovering,
  // and `offsetX` how far it's been dragged horizontally (drives the depth
  // projection, i.e. re-nesting under a different parent).
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetX, setOffsetX] = useState(0);
  const handle = slugify(name);
  const fieldRequiredText = t('sectionBuilder:onlineStore.menus.itemFieldRequired', 'Field cannot be empty');

  // Popup (ce-ui/ui/popup.tsx) already locks body scroll while `open` itself,
  // but has no Escape-to-close handling of its own — kept here so this form
  // doesn't regress the keyboard behavior the previous hand-built drawer had.
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const addItem = () => {
    // url starts as '' (not '/') so the Link input shows its "Search or
    // paste link" placeholder for a brand-new blank item instead of looking
    // like it already has a real value — PageLinkCombobox and the
    // SAVE_MENU/render paths (header/footer Renderer.jsx) already treat an
    // empty url as just another free-text value, so no fallback is needed.
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label: '', url: '' }]);
  };

  // "Restore to Default" — only offered for the two protected menus
  // (main-menu/footer-menu), each of which has a canonical factory item list
  // in builderReducer.js's DEFAULT_MENU_ITEMS. Wholesale-replaces the
  // in-progress items (not merged/appended) and clears any stale per-item
  // validation errors, mirroring how loading an existing menu into this
  // drawer seeds `items` in the first place.
  const canRestoreDefault = menu && PROTECTED_MENU_IDS.includes(menu.id);
  const restoreDefaultItems = () => {
    const defaults = DEFAULT_MENU_ITEMS[menu.id] ?? [];
    setItems(defaults.map((item) => ({ ...item })));
    setItemErrors({});
  };

  // Adds a brand-new child under `parentId` (at any depth up to MAX_DEPTH -
  // 1) and makes sure that parent is expanded so the new (blank) row is
  // immediately visible/editable — same blank-url convention as the
  // top-level addItem above.
  const addChildItem = (parentId) => {
    setItems((prev) => addChildToTree(prev, parentId, { id: crypto.randomUUID(), label: '', url: '' }));
    setExpandedIds((prev) => new Set(prev).add(parentId));
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeItem = (id) => {
    setItems((prev) => removeNodeFromTree(prev, id));
    setItemErrors((prev) => {
      if (!prev[id]) return prev;
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const updateItem = (id, patch) => {
    setItems((prev) => updateNodeInTree(prev, id, patch));
    // Clear only the field(s) just edited — the other field's error (if any)
    // stays until it's fixed too, so fixing the label alone doesn't also
    // silently drop a still-blank link's error.
    setItemErrors((prev) => {
      if (!prev[id]) return prev;
      const cleared = { ...prev[id] };
      if ('label' in patch) cleared.label = false;
      if ('url' in patch) cleared.url = false;
      if (!cleared.label && !cleared.url) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: cleared };
    });
  };

  const handleSaveClick = () => {
    const nameBad = !name.trim();
    setNameError(nameBad ? fieldRequiredText : null);

    const errors = validateTree(items);
    setItemErrors(errors);

    if (nameBad || Object.keys(errors).length > 0) return;
    setSaving(true);
    // Fake the round-trip — nothing here is actually async (runDraftAction
    // is synchronous local-storage state), so a fixed delay is what makes
    // the Save button's loading state visible at all.
    setTimeout(() => {
      setSaving(false);
      onSave({ name: name.trim(), items });
    }, 800);
  };

  // Pointer/touch only (same activation constraints as
  // RepeaterField.jsx/SectionListItem.jsx's flat drag lists) — no keyboard
  // sensor here since re-nesting via horizontal drag distance (below) has no
  // keyboard-equivalent gesture yet.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // The full tree flattened into display order — `depth`/`parentId` per row
  // drive both indentation and the drag projection below (see menuTree.js).
  const flatItems = useMemo(() => flattenTree(items), [items]);

  // Rows hidden by a collapsed ancestor, plus (while dragging) the dragged
  // item's own children — they move as one block with their parent, so they
  // don't need to render as separate rows mid-drag.
  const collapsedIds = useMemo(
    () => flatItems.filter((item) => item.children?.length && !expandedIds.has(item.id)).map((item) => item.id),
    [flatItems, expandedIds]
  );
  const visibleItems = useMemo(
    () => removeChildrenOf(flatItems, activeId ? [...collapsedIds, activeId] : collapsedIds),
    [flatItems, collapsedIds, activeId]
  );

  // Where the dragged item would land — depth + new parent — if dropped on
  // `overId` right now; recomputed continuously from onDragMove below.
  const projected = useMemo(
    () => (activeId && overId ? getProjection(visibleItems, activeId, overId, offsetX) : null),
    [visibleItems, activeId, overId, offsetX]
  );

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    setOverId(active.id);
    setOffsetX(0);
  };

  const handleDragMove = ({ delta, over }) => {
    setOffsetX(delta.x);
    setOverId(over?.id ?? null);
  };

  // Recomputes the projection fresh from the drag event's own final `delta`
  // (rather than trusting the `projected` memo above, which reflects the
  // last onDragMove-driven render) — the pointerup that ends a drag can fire
  // before React has re-rendered from that last onDragMove's setState calls,
  // so relying on that memo here risked committing a one-tick-stale depth/
  // parent. Recomputing from `active`/`over`/`delta` directly (all provided
  // fresh on the end event itself) makes the commit correct regardless of
  // that render timing.
  const handleDragEnd = ({ active, over, delta }) => {
    setActiveId(null);
    setOverId(null);
    setOffsetX(0);
    if (!over || active.id === over.id) return;
    // Computed directly against this render's `items`/`expandedIds` (not
    // inside the setItems functional-updater form) so the just-computed
    // `parentId` is available right here to also drive the expandedIds
    // update below, with no risk of the two falling out of sync.
    const flat = flattenTree(items);
    const collapsed = flat.filter((item) => item.children?.length && !expandedIds.has(item.id)).map((item) => item.id);
    const visible = removeChildrenOf(flat, [...collapsed, active.id]);
    const proj = getProjection(visible, active.id, over.id, delta.x);
    if (!proj) return;
    setItems(buildTree(moveItemAfter(flat, active.id, over.id, proj.parentId)));
    // The item just became (or stayed) a child of `proj.parentId` — auto-open
    // that parent so the drop's result is immediately visible instead of
    // looking like the drag silently did nothing (its new child collapsed
    // out of view under an unopened chevron).
    if (proj.parentId) {
      setExpandedIds((prev) => (prev.has(proj.parentId) ? prev : new Set(prev).add(proj.parentId)));
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    setOffsetX(0);
  };

  // Builds the row list, deferring each expanded item's "Add menu item to
  // X" affordance until *after* its full subtree instead of right beneath
  // its own row — `visibleItems` is in contiguous depth-first order, so an
  // item's descendants are exactly the run of rows immediately following it
  // with a greater depth; `pending` is a stack (innermost/deepest first) of
  // expanded items still waiting on that button, flushed whenever the next
  // row's depth shows their subtree has closed.
  function renderMenuItemRows() {
    const rows = [];
    const pending = [];
    const flushDueBefore = (nextDepth) => {
      while (pending.length && nextDepth <= pending[pending.length - 1].depth) {
        const closed = pending.pop();
        rows.push(
          <div
            key={`add-child-${closed.id}`}
            className="border-b border-lb-line-1 bg-lb-surface py-2 pr-4"
            style={{ paddingLeft: 16 + (closed.depth + 1) * INDENT_WIDTH }}
          >
            <button
              type="button"
              onClick={() => addChildItem(closed.id)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-lb-brand hover:underline"
            >
              <Plus size={14} />
              {t('sectionBuilder:onlineStore.menus.addChildItem', 'Add menu item to {{label}}', {
                label: closed.label?.trim() || t('sectionBuilder:onlineStore.menus.thisItem', 'this item'),
              })}
            </button>
          </div>
        );
      }
    };

    visibleItems.forEach((item, index) => {
      const isActive = item.id === activeId;
      // The active row's own indentation previews the depth it would land
      // at if dropped right now — every other row keeps its actual depth,
      // only reordering (via the indicator line below) rather than
      // re-indenting.
      const depth = isActive && projected ? projected.depth : item.depth;
      // The indicator renders directly under whichever row is currently
      // hovered (`overId`) — matching getProjection's "drop lands right
      // after the hovered row" placement (menuTree.js), so a rightward drag
      // while hovering over a row visibly previews nesting *under* that row.
      const showIndicator = activeId != null && overId === item.id && item.id !== activeId;
      // Used both to decide whether this is the last row inside its own
      // ancestors' blocks (guide-line termination, see MenuItemRow) and to
      // close out any pending "Add menu item to X" buttons below.
      const nextDepth = visibleItems[index + 1]?.depth ?? -1;

      rows.push(
        <MenuItemRow
          key={item.id}
          item={item}
          pages={pages}
          depth={depth}
          nextDepth={nextDepth}
          isDragging={isActive}
          error={itemErrors[item.id]}
          expanded={expandedIds.has(item.id)}
          onToggleExpand={() => toggleExpand(item.id)}
          onChange={(patch) => updateItem(item.id, patch)}
          onRemove={() => removeItem(item.id)}
        />
      );
      if (showIndicator) rows.push(<DropIndicatorLine key={`indicator-${item.id}`} depth={projected?.depth ?? depth} />);
      if (expandedIds.has(item.id) && item.depth < MAX_DEPTH) pending.push(item);

      flushDueBefore(nextDepth);
    });

    return rows;
  }

  return (
    <Popup
      open
      onClose={onClose}
      platform="desktop"
      align="left"
      className="menu-form-popup"
      testId="menu-form-drawer"
      title={
        isNew
          ? t('sectionBuilder:onlineStore.menus.createMenuTitle', 'Add New Menu')
          : t('sectionBuilder:onlineStore.menus.editMenuTitle', 'Edit Menu')
      }
      secondaryAction={{
        label: t('sectionBuilder:editor.common.cancel', 'Cancel'),
        onClick: onClose,
      }}
      primaryAction={{
        label: isNew
          ? t('sectionBuilder:onlineStore.menus.save', 'Save')
          : t('sectionBuilder:onlineStore.menus.saveChanges', 'Save Changes'),
        onClick: handleSaveClick,
        loading: saving,
        disabled: saving,
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <TextField
            label={t('sectionBuilder:onlineStore.menus.nameLabel', 'Name')}
            required
            size="lg"
            autoFocus={isNew}
            value={name}
            onChange={(e) => {
              setName(e.target.value.slice(0, MENU_NAME_MAX_LENGTH));
              if (nameError) setNameError(null);
            }}
            placeholder={t('sectionBuilder:onlineStore.menus.namePlaceholder', 'e.g. Main menu')}
            errorText={nameError}
            maxLength={MENU_NAME_MAX_LENGTH}
            showCount
          />
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <span>{t('sectionBuilder:onlineStore.menus.handlePrefix', 'Handle: {{handle}}', { handle: handle || '—' })}</span>
            <Tooltip content={t('sectionBuilder:onlineStore.menus.handleHelpTooltip', 'Handle is the unique id used to reference this menu in code')}>
              <Info size={12} className="shrink-0 text-gray-400" aria-hidden="true" />
            </Tooltip>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* No outer border/rounding here — only the horizontal divider
              lines between the header and rows (border-b on each) remain,
              matching Table's own row dividers instead of a bordered card
              outline. No `overflow-hidden` either: PageLinkCombobox's
              suggestion list now renders through a portal (see that file),
              so nothing here needs to stay unclipped for it anymore, but
              there's still no reason to clip anything else in this column. */}
          <div>
            {items.length === 0 ? (
              <>
                {canRestoreDefault && (
                  <div className="mb-2 flex justify-end">
                    <MainBtn
                      variant="tertiary"
                      size="sm"
                      leftIcon={<RotateCcw size={14} />}
                      label={t('sectionBuilder:onlineStore.menus.restoreDefault', 'Restore to Default')}
                      onClick={restoreDefaultItems}
                    />
                  </div>
                )}
                <div className="flex items-center justify-center rounded-lb-card border-2 border-dashed border-lb-line-2 bg-lb-surface px-4 py-10 font-lb text-[14px] text-lb-on-surface-3">
                  {t('sectionBuilder:onlineStore.menus.noItems', 'No menu items yet.')}
                </div>
              </>
            ) : (
              <>
                {/* Header row classnames copied from Table's own <thead>/<th> (ce-ui/ui/table.tsx)
                    so this hand-rolled header is visually indistinguishable from a real Table
                    instance: h-[49px]/pl-4 cell box, bg-lb-surface header background,
                    border-lb-line-2 divider, font-lb/font-lb-bold text-lb-on-surface typography.
                    No right padding (`pr-0`, unlike Table's own `px-4`) — "Restore to
                    Default" sits flush against the row's right edge instead of leaving a
                    gap. Hidden entirely in the empty state above — a header with nothing
                    under it reads oddly next to the dashed placeholder box. */}
                <div className="relative flex h-[49px] items-center gap-2 border-b border-lb-line-2 bg-lb-surface pl-4 pr-0">
                  {/* Mirrors MenuItemRow's own top-level widths exactly — a
                      w-1/2 cluster holding the drag-handle (w-5) + chevron
                      (w-6) spacers ahead of the "Menu Item" label, then a
                      second w-1/2 for "Link" — so the Link column stays
                      aligned under this header at every nesting depth (only
                      the cluster's *inside* indents per row, never this
                      header or the Link column itself). "Restore to Default"
                      is absolutely positioned over this same row (rather than
                      taking up flex space) so it doesn't shrink either w-1/2
                      column out of alignment with the cell widths below. */}
                  <div className="flex w-1/2 items-center gap-2">
                    <span className="w-5 shrink-0" aria-hidden="true" />
                    <span className="w-6 shrink-0" aria-hidden="true" />
                    <span className="font-lb font-lb-bold text-[14px] leading-[20px] text-lb-on-surface">
                      {t('sectionBuilder:onlineStore.menus.itemLabelField', 'Menu Item')}
                    </span>
                  </div>
                  <span className="w-1/2 font-lb font-lb-bold text-[14px] leading-[20px] text-lb-on-surface">
                    {t('sectionBuilder:onlineStore.menus.itemLinkField', 'Link')}
                  </span>
                  <span className="w-5 shrink-0" aria-hidden="true" />
                  {canRestoreDefault && (
                    <MainBtn
                      variant="tertiary"
                      size="sm"
                      leftIcon={<RotateCcw size={14} />}
                      label={t('sectionBuilder:onlineStore.menus.restoreDefault', 'Restore to Default')}
                      onClick={restoreDefaultItems}
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                    />
                  )}
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  {renderMenuItemRows()}
                </DndContext>
              </>
            )}
          </div>
          <MainBtn
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            label={t('sectionBuilder:onlineStore.menus.addItem', 'Add menu item')}
            onClick={addItem}
            className="mt-1 w-fit"
          />
        </div>
      </div>
    </Popup>
  );
}

// Same "slug + short unique suffix on collision" convention as
// pageHelpers.js's createPageId, applied to menu ids instead of page ids —
// menu ids are used as `state.menus` object keys (and as the
// `nav_menu_ref.menuId` a header/footer section stores), so they must be
// unique and stable, not merely human-readable.
function createMenuId(name, existingMenus) {
  const base = slugify(name) || 'menu';
  if (!existingMenus[base]) return base;
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * @module pages/online-store/MenusManagement
 * @description Content > Menus — Shopify-style list of the site's navigation
 * menus (`state.menus`, see builderReducer.js createInitialState/
 * ACTIONS.SAVE_MENU), each opening into MenuFormDrawer above to name the menu
 * and add/edit/reorder/remove its `{label, url}` items in one form. Header/
 * footer sections reference one of these menus by id via their
 * `nav_menu_ref` field.
 */
export default function MenusManagement() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [draft, setDraft] = useState(() => loadOrSeedDemoDraft(STORE_ID));
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [creatingMenu, setCreatingMenu] = useState(false);
  // Set to the menu being deleted while its ConfirmDialog is open — holds
  // the id (not just a boolean) so the dialog can interpolate the menu's
  // name into its confirm text.
  const [deletingMenuId, setDeletingMenuId] = useState(null);

  // Search + pagination — same local-state/useMemo shape as
  // PagesManagement.jsx's own filteredPages/pagedPages pair.
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  // ── Simulate panel state — no real backend to fail/conflict/delay
  // against, so these are local toggles exercising the negative/edge
  // states on demand (see PagesManagement.jsx / ThemeGallery.jsx for the
  // same convention). All default "off" so normal usage is unaffected.
  const [simulateLoadError, setSimulateLoadError] = useState(false);
  const [simulateSaveFailure, setSimulateSaveFailure] = useState(false);
  const [simulateSaveConflict, setSimulateSaveConflict] = useState(false);
  const [simulateManyItems, setSimulateManyItems] = useState(false);
  const [simulateDeletedElsewhere, setSimulateDeletedElsewhere] = useState(false);
  const [simulateInUseByTheme, setSimulateInUseByTheme] = useState(false);
  const [simulateDeleteError, setSimulateDeleteError] = useState(false);

  // Which menu the "deleted elsewhere" / "in use by a theme" simulations
  // apply to — the first non-protected menu, resolved lazily below (the
  // menus list itself isn't available yet at this point in the module).
  const menus = useMemo(() => Object.values(draft.menus ?? {}), [draft.menus]);
  const pages = draft.pages ?? [];
  const editingMenu = editingMenuId ? draft.menus?.[editingMenuId] : null;

  const simulateTargetMenu = useMemo(
    () => menus.find((menu) => !PROTECTED_MENU_IDS.includes(menu.id)) ?? null,
    [menus]
  );
  const simulatedInUseThemeNames = useMemo(() => {
    // Mock connection — references real theme names from the roster (not a
    // made-up name) so the blocking modal reads as plausible.
    const names = THEME_ROSTER.filter((theme) => !theme.comingSoon).slice(0, 1).map((theme) => theme.name);
    return names.length ? names : ['Xinear'];
  }, []);

  // Bulks the list out past 25 rows (real menus + fake extras) so the
  // table's pagination controls actually have something to page through.
  const listMenus = useMemo(() => {
    if (!simulateManyItems) return menus;
    const extra = Array.from({ length: Math.max(0, 30 - menus.length) }).map((_, i) => ({
      id: `__simulated-menu-${i}`,
      name: `Simulated menu ${i + 1}`,
      items: [],
    }));
    return [...menus, ...extra];
  }, [menus, simulateManyItems]);

  const filteredMenus = useMemo(() => {
    if (!search.trim()) return listMenus;
    const needle = search.trim().toLowerCase();
    return listMenus.filter((menu) => (menu.name ?? '').toLowerCase().includes(needle));
  }, [listMenus, search]);

  const sortedMenus = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredMenus;
    const factor = sortDirection === 'asc' ? 1 : -1;
    return [...filteredMenus].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '') * factor);
  }, [filteredMenus, sortKey, sortDirection]);

  const pagedMenus = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedMenus.slice(start, start + perPage);
  }, [sortedMenus, page, perPage]);

  const isSimulatedDeletedElsewhere = (menuId) => simulateDeletedElsewhere && menuId === simulateTargetMenu?.id;
  const isSimulatedInUseByTheme = (menuId) => simulateInUseByTheme && menuId === simulateTargetMenu?.id;

  const handleSaveExisting = ({ name, items }) => {
    if (isSimulatedDeletedElsewhere(editingMenuId)) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.deletedElsewhereSnackbar', 'This menu no longer exists'), 'red');
      setEditingMenuId(null);
      return;
    }
    if (simulateSaveFailure) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.saveFailedSnackbar', 'Failed to save menu'), 'red');
      return;
    }
    if (simulateSaveConflict) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.saveConflictSnackbar', 'Menu updated elsewhere. Reload to continue'), 'red');
      return;
    }
    const next = runDraftAction(STORE_ID, { type: ACTIONS.SAVE_MENU, id: editingMenuId, name, items });
    setDraft(next);
    setEditingMenuId(null);
    showSnackbar(t('sectionBuilder:onlineStore.menus.savedSnackbar', 'Menu successfully saved'), 'green');
  };

  const handleSaveNew = ({ name, items }) => {
    if (simulateSaveFailure) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.saveFailedSnackbar', 'Failed to save menu'), 'red');
      return;
    }
    if (simulateSaveConflict) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.saveConflictSnackbar', 'Menu updated elsewhere. Reload to continue'), 'red');
      return;
    }
    const id = createMenuId(name, draft.menus ?? {});
    const next = runDraftAction(STORE_ID, { type: ACTIONS.SAVE_MENU, id, name, items });
    setDraft(next);
    setCreatingMenu(false);
    showSnackbar(t('sectionBuilder:onlineStore.menus.savedSnackbar', 'Menu successfully saved'), 'green');
  };

  // Row-level Edit click — refuses up front for a menu simulated as
  // "deleted elsewhere" instead of opening the (now-stale) form.
  const handleEditClick = (menuId) => {
    if (isSimulatedDeletedElsewhere(menuId)) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.deletedElsewhereSnackbar', 'This menu no longer exists'), 'red');
      return;
    }
    setEditingMenuId(menuId);
  };

  // Row-level Delete click — routes to whichever of the three delete states
  // applies: deleted-elsewhere refusal, the blocking "used in a theme"
  // modal, or (for every other menu) the normal ConfirmDialog.
  const handleDeleteClick = (menuId) => {
    if (isSimulatedDeletedElsewhere(menuId)) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.deletedElsewhereSnackbar', 'This menu no longer exists'), 'red');
      return;
    }
    if (isSimulatedInUseByTheme(menuId)) {
      setInUseMenuId(menuId);
      return;
    }
    setDeletingMenuId(menuId);
  };

  // Confirming ConfirmDialog closes both the confirm dialog AND the edit
  // drawer (there's nothing left to edit once the menu is gone) and
  // refreshes the list from the just-persisted draft.
  const handleConfirmDelete = () => {
    if (simulateDeleteError) {
      showSnackbar(t('sectionBuilder:onlineStore.menus.deleteFailedSnackbar', 'Failed to delete menu'), 'red');
      setDeletingMenuId(null);
      return;
    }
    const next = runDraftAction(STORE_ID, { type: ACTIONS.DELETE_MENU, id: deletingMenuId });
    setDraft(next);
    showSnackbar(t('sectionBuilder:onlineStore.menus.deletedSnackbar', 'Menu successfully deleted'), 'grey');
    setDeletingMenuId(null);
    setEditingMenuId(null);
  };

  const deletingMenu = deletingMenuId ? draft.menus?.[deletingMenuId] : null;

  // Blocking "can't delete — used in a theme" modal state — the id of the
  // menu it's currently naming, or null when closed.
  const [inUseMenuId, setInUseMenuId] = useState(null);
  const inUseMenu = inUseMenuId ? (draft.menus?.[inUseMenuId] ?? listMenus.find((m) => m.id === inUseMenuId)) : null;

  const simulateOptions = [
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.menus.simulateLoadError', 'Simulate load error'),
      checked: simulateLoadError,
      onChange: setSimulateLoadError,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.menus.simulateSaveFailure', 'Simulate save failure'),
      checked: simulateSaveFailure,
      onChange: setSimulateSaveFailure,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.menus.simulateSaveConflict', 'Simulate save conflict'),
      checked: simulateSaveConflict,
      onChange: setSimulateSaveConflict,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.menus.simulateManyItems', 'Simulate many menus (pagination)'),
      checked: simulateManyItems,
      onChange: setSimulateManyItems,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.menus.simulateDeletedElsewhere', 'Mark a menu as deleted elsewhere'),
      checked: simulateDeletedElsewhere,
      onChange: setSimulateDeletedElsewhere,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.menus.simulateInUseByTheme', 'Mark a menu as used by a theme'),
      checked: simulateInUseByTheme,
      onChange: setSimulateInUseByTheme,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.menus.simulateDeleteError', 'Simulate delete error'),
      checked: simulateDeleteError,
      onChange: setSimulateDeleteError,
    },
  ];

  const columns = [
    {
      key: 'name',
      header: t('sectionBuilder:onlineStore.menus.columnName', 'Name'),
      width: 360,
      sortable: true,
      render: (value) => <span style={{ color: '#282828' }}>{value}</span>,
    },
    {
      key: 'items',
      header: t('sectionBuilder:onlineStore.menus.columnItems', 'Items'),
      // Item *names* (comma-joined), not a count — a blank/unlabeled item
      // (freshly added via "Add menu item", not yet given a label) is
      // dropped from the list rather than showing as an empty entry between
      // two commas.
      render: (value) => {
        const labels = value.flatMap((item) => [item.label?.trim(), ...(item.children ?? []).map((child) => child.label?.trim())]).filter(Boolean);
        return labels.length ? (
          <span className="block truncate" title={labels.join(', ')}>
            {labels.join(', ')}
          </span>
        ) : (
          <span className="text-lb-on-surface-3">{t('sectionBuilder:onlineStore.menus.noItemsShort', 'No items')}</span>
        );
      },
    },
    {
      key: 'actions',
      width: 100,
      align: 'right',
      header: t('sectionBuilder:onlineStore.menus.columnActions', 'Actions'),
      // Row click no longer opens the edit modal — Edit/Delete are the only
      // way into a menu now, so this column carries both as tertiary
      // (ghost-style) icon buttons rather than the whole row being a target.
      render: (_value, row) => {
        const isProtected = PROTECTED_MENU_IDS.includes(row.id);
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip content={t('sectionBuilder:onlineStore.menus.editTooltip', 'Edit')}>
              <IconBtn
                variant="ghost"
                size="sm"
                icon={<Pencil size={16} />}
                aria-label={t('sectionBuilder:onlineStore.menus.editTooltip', 'Edit')}
                onClick={() => handleEditClick(row.id)}
              />
            </Tooltip>
            <Tooltip
              content={
                isProtected
                  ? t('sectionBuilder:onlineStore.menus.deleteProtectedTooltip', "This menu can't be deleted")
                  : t('sectionBuilder:onlineStore.menus.deleteTooltip', 'Delete')
              }
            >
              <IconBtn
                variant="danger-ghost"
                size="sm"
                icon={<Trash2 size={16} />}
                disabled={isProtected}
                aria-label={t('sectionBuilder:onlineStore.menus.deleteTooltip', 'Delete')}
                onClick={() => handleDeleteClick(row.id)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Sticky, whole-screen error state (same convention as PagesManagement's
  // own simulateLoadError) — takes over in place of the header + table.
  if (simulateLoadError) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
        <div className="flex h-full min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-1 text-xl font-bold text-gray-800">
            {t('sectionBuilder:onlineStore.pageEditor.loadErrorTitle', 'Couldn’t load this page')}
          </h1>
          <p className="mb-4 text-sm text-gray-500">
            {t('sectionBuilder:onlineStore.pageEditor.loadErrorDescription', 'Something went wrong while loading the page. Please try again.')}
          </p>
          <MainBtn
            variant="secondary"
            size="sm"
            label={t('sectionBuilder:onlineStore.pageEditor.loadErrorReload', 'Reload Page')}
            onClick={() => setDraft(loadOrSeedDemoDraft(STORE_ID))}
          />
        </div>
        <SimulateTrigger options={simulateOptions} />
      </div>
    );
  }

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
            {t('sectionBuilder:onlineStore.menus.heading', 'Menus')}
          </h1>
          <MainBtn
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            label={t('sectionBuilder:onlineStore.menus.create', 'New Menu')}
            onClick={() => setCreatingMenu(true)}
          />
        </div>

        {/* No wrapper styling here — Table (ce-ui) already paints its own
            white background + 12px rounded corners + overflow-hidden on
            this exact box (table.tsx's root div). Duplicating the same
            background/border-radius on this outer div doesn't add
            anything and risks a hairline seam at the bottom corners at
            certain zoom/DPI levels, since two independently-rasterized
            rounded rects of the same radius on the same rect don't always
            composite pixel-for-pixel identically — hence the "table
            outline is cropped" artifact this replaces. No `onRowClick`
            either — Edit/Delete in the Actions column are the only way
            into a row now, so the row itself carries no click/hover
            affordance (Table only adds its built-in hover-bg/cursor-pointer
            when onRowClick is passed). `maxHeight` (not a stretched `flex-1`)
            is what makes this hug its content when there are only a few
            rows and only cap + scroll internally (Table's own sticky thead
            + overflow-auto region) once the row count would otherwise push
            past the available viewport space. */}
        <div style={{ maxHeight: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column' }}>
          <Table
            columns={columns}
          data={pagedMenus}
          totalRows={filteredMenus.length}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
            setPage(1);
          }}
          hidePaginationOnSinglePage
          filters={{
            search: {
              value: search,
              onChange: (value) => {
                setSearch(value);
                setPage(1);
              },
              placeholder: t('sectionBuilder:onlineStore.menus.searchPlaceholder', 'Search by menu name'),
            },
            rowsPerPage: {
              onChange: (nextPerPage) => {
                setPerPage(nextPerPage);
                setPage(1);
              },
            },
          }}
          emptyStateTitle={
            search.trim()
              ? t('sectionBuilder:onlineStore.menus.noSearchResultsTitle', 'No Search Results Found')
              : t('sectionBuilder:onlineStore.menus.noMenus', 'No menus yet')
          }
          emptyStateDescription={
            search.trim()
              ? t('sectionBuilder:onlineStore.menus.noSearchResultsDescription', 'Try searching with a different term, okay?')
              : undefined
          }
          />
        </div>
      </div>

      <SimulateTrigger options={simulateOptions} />

      {editingMenu && (
        <MenuFormDrawer
          menu={editingMenu}
          isNew={false}
          pages={pages}
          onSave={handleSaveExisting}
          onClose={() => setEditingMenuId(null)}
        />
      )}
      {creatingMenu && (
        <MenuFormDrawer
          menu={null}
          isNew
          pages={pages}
          onSave={handleSaveNew}
          onClose={() => setCreatingMenu(false)}
        />
      )}

      <ConfirmDialog
        open={!!deletingMenu}
        danger
        title={t('sectionBuilder:onlineStore.menus.deleteConfirmTitle', 'Delete this menu?')}
        description={t('sectionBuilder:onlineStore.menus.deleteConfirmDescription', 'This menu and its items will be permanently deleted.')}
        confirmLabel={t('sectionBuilder:onlineStore.menus.deleteConfirm', 'Yes, Delete')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMenuId(null)}
      />

      {/* Blocking "can't delete" explainer — a single-action Popup (not
          ConfirmDialog, which is a confirm/cancel pair) since there's
          nothing to confirm here, just an explanation + acknowledgement. */}
      <Popup
        open={Boolean(inUseMenu)}
        onClose={() => setInUseMenuId(null)}
        title={t('sectionBuilder:onlineStore.menus.cantDeleteInUseTitle', "Can't delete this menu")}
        description={t(
          'sectionBuilder:onlineStore.menus.cantDeleteInUseDescription',
          '"{{name}}" can\'t be deleted because it\'s currently used by {{themes}}. Remove it from that theme first, then try again.',
          { name: inUseMenu?.name ?? '', themes: simulatedInUseThemeNames.join(', ') }
        )}
        platform="desktop"
        primaryAction={{
          label: t('sectionBuilder:onlineStore.menus.cantDeleteInUseClose', 'Got it'),
          onClick: () => setInUseMenuId(null),
        }}
      />
    </div>
  );
}
