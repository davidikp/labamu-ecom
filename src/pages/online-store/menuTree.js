// Tree utilities for MenusManagement.jsx's drag-and-drop menu item editor —
// the standard "flatten / project / rebuild" trio from dnd-kit's own
// sortable-tree recipe, adapted to this codebase's `{id, label, url,
// children}` menu item shape. Kept in its own module (rather than inline in
// MenusManagement.jsx) since none of this is React/JSX — it's pure data
// transforms that are easiest to reason about (and unit test) in isolation.

// Three levels total: a top-level item, its children, and their children —
// matches Shopify's own menu editor depth limit.
export const MAX_DEPTH = 2;
export const INDENT_WIDTH = 24;

// Depth-first flatten of the tree into `{ ...item, depth, parentId, index }`
// rows, in display order. `children` stays on each row (used for chevron/
// child-count rendering) but is no longer the source of truth for order —
// once flattened, `parentId` + array order is.
export function flattenTree(items, parentId = null, depth = 0) {
  return items.reduce((acc, item, index) => {
    return [...acc, { ...item, parentId, depth, index }, ...flattenTree(item.children ?? [], item.id, depth + 1)];
  }, []);
}

// Inverse of flattenTree — rebuilds the nested `children` structure purely
// from each row's `parentId`, in whatever order the flat array is in. Stored
// `depth`/`index` are ignored (they're only ever used to drive the UI/drag
// projection, not persisted structure), so a row whose `parentId` changed
// during a drag naturally lands under its new parent with no separate
// "recompute descendant depths" step.
export function buildTree(flatItems) {
  const nodes = new Map(flatItems.map((item) => [item.id, { id: item.id, label: item.label, url: item.url, children: [] }]));
  const roots = [];
  flatItems.forEach((item) => {
    const node = nodes.get(item.id);
    const parent = item.parentId != null ? nodes.get(item.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  // Strip empty `children` arrays so leaf items match the shape they had
  // before ever gaining a child (no stray `children: []` in saved data).
  function clean(node) {
    if (node.children.length === 0) delete node.children;
    else node.children.forEach(clean);
    return node;
  }
  roots.forEach(clean);
  return roots;
}

// Hides the descendants of every id in `ids` (parents collapsed in the UI,
// plus — during an active drag — the item being dragged, so its own
// children don't render as separate rows while their ancestor moves as one
// block). Walks `flatItems` in its existing DFS order, accumulating newly-
// hidden descendant ids as it goes so grandchildren of a hidden id are
// dropped too.
export function removeChildrenOf(flatItems, ids) {
  const excluded = [...ids];
  return flatItems.filter((item) => {
    if (item.parentId != null && excluded.includes(item.parentId)) {
      if (item.children?.length) excluded.push(item.id);
      return false;
    }
    return true;
  });
}

function getDragDepth(offsetX, indentationWidth) {
  return Math.round(offsetX / indentationWidth);
}

// Projects where `activeId` would land — as depth + new parentId — if
// dropped just *after* `overId`'s row, given how far right/left the row has
// been dragged (`offsetX`, in px). `visibleItems` is the flattened,
// collapse-filtered list currently rendered (see removeChildrenOf above).
//
// Landing "after" the hovered row (not "at" it, i.e. not swapping places
// with it) is the deliberate choice here: it means `overId`'s own item is
// always `previousItem` below, so dragging right while hovering directly
// over a row nests the dragged item as *that row's* child — the natural
// "drop onto Orders to nest under Orders" gesture — rather than requiring
// the merchant to hover over the row *below* the intended parent instead.
export function getProjection(visibleItems, activeId, overId, offsetX, indentationWidth = INDENT_WIDTH) {
  const activeItem = visibleItems.find((item) => item.id === activeId);
  if (!activeItem || activeId === overId) return null;
  const withoutActive = visibleItems.filter((item) => item.id !== activeId);
  const overIndex = withoutActive.findIndex((item) => item.id === overId);
  if (overIndex === -1) return null;
  const insertAt = overIndex + 1;
  const previousItem = withoutActive[insertAt - 1]; // always the hovered row itself
  const nextItem = withoutActive[insertAt];
  const dragDepth = getDragDepth(offsetX, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  const maxDepth = previousItem ? Math.min(previousItem.depth + 1, MAX_DEPTH) : 0;
  const minDepth = nextItem ? nextItem.depth : 0;

  let depth = projectedDepth;
  if (projectedDepth >= maxDepth) depth = maxDepth;
  else if (projectedDepth < minDepth) depth = minDepth;

  return { depth, parentId: getParentId(depth, previousItem, withoutActive, insertAt) };
}

function getParentId(depth, previousItem, itemsWithoutActive, insertAt) {
  if (depth === 0 || !previousItem) return null;
  if (depth === previousItem.depth) return previousItem.parentId;
  if (depth > previousItem.depth) return previousItem.id;
  const nextAncestor = itemsWithoutActive
    .slice(0, insertAt)
    .reverse()
    .find((item) => item.depth === depth);
  return nextAncestor ? nextAncestor.parentId : null;
}

// Removes `activeId` from the flat list and reinserts it immediately after
// `overId` (matching getProjection's own "insert after the hovered row"
// placement above), with its `parentId` set to `parentId`. Used by
// MenuFormDrawer's onDragEnd to commit the drop — kept here alongside
// getProjection since the two must always agree on where "after overId"
// actually is.
export function moveItemAfter(flatItems, activeId, overId, parentId) {
  const cloned = flatItems.slice();
  const activeIndex = cloned.findIndex((item) => item.id === activeId);
  if (activeIndex === -1) return flatItems;
  const [activeNode] = cloned.splice(activeIndex, 1);
  const overIndex = cloned.findIndex((item) => item.id === overId);
  if (overIndex === -1) return flatItems;
  cloned.splice(overIndex + 1, 0, { ...activeNode, parentId });
  return cloned;
}

// Recursive helpers used by MenuFormDrawer for editing the tree — update/
// remove/add-child all need to find a node by id at any depth, not just the
// top level.
export function updateNodeInTree(items, id, patch) {
  return items.map((item) => {
    if (item.id === id) return { ...item, ...patch };
    if (item.children?.length) return { ...item, children: updateNodeInTree(item.children, id, patch) };
    return item;
  });
}

export function removeNodeFromTree(items, id) {
  return items
    .filter((item) => item.id !== id)
    .map((item) => (item.children?.length ? { ...item, children: removeNodeFromTree(item.children, id) } : item));
}

export function addChildToTree(items, parentId, child) {
  return items.map((item) => {
    if (item.id === parentId) return { ...item, children: [...(item.children ?? []), child] };
    if (item.children?.length) return { ...item, children: addChildToTree(item.children, parentId, child) };
    return item;
  });
}

export function validateTree(items, errors = {}) {
  items.forEach((item) => {
    const labelBad = !item.label?.trim();
    const urlBad = !item.url?.trim();
    if (labelBad || urlBad) errors[item.id] = { label: labelBad, url: urlBad };
    if (item.children?.length) validateTree(item.children, errors);
  });
  return errors;
}
