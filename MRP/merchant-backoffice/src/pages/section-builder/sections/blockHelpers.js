/**
 * @module section-builder/sections/blockHelpers
 * @description Helpers for the section *blocks* model (Shopify-style typed
 * blocks). A section declares a `blockConfig` in its schema:
 *   { allowed: [<blockType>], presets: [<blockType>], max, legacyDataKey }
 * Block type field-schemas + renderers live centrally in blocks/registry.js,
 * so a type (e.g. `heading`) is defined once and reused across sections.
 *
 * On-canvas block selection is encoded as a compound id string
 * (`"<sectionId>::<blockId>"`) so the reducer's `selection: { id }` shape and
 * every existing `selectedId === 'header'`-style check stay untouched.
 */
import { SECTION_DEFINITIONS } from './index';
import { defaultsForSchema } from './schemaDefaults';
import { blockDef } from './blocks/registry';

const SEP = '::';

export function blockConfigForType(sectionType) {
  return SECTION_DEFINITIONS[sectionType]?.blockConfig ?? null;
}

export function sectionSupportsBlocks(sectionType) {
  const cfg = blockConfigForType(sectionType);
  return !!cfg && (cfg.allowed?.length ?? 0) > 0;
}

/** Field/label/icon/Renderer definition for a block type (section-agnostic). */
export function blockTypeDef(_sectionType, blockType) {
  return blockDef(blockType);
}

/** The block types a section allows, as [{ type, ...def }]. */
export function blockTypesForSection(sectionType) {
  const cfg = blockConfigForType(sectionType);
  if (!cfg?.allowed) return [];
  return cfg.allowed.map((type) => ({ type, ...blockDef(type) })).filter((d) => d.label);
}

/** A fresh block instance with defaults filled in (crypto — create-time only). */
export function makeBlock(_sectionType, blockType) {
  const def = blockDef(blockType);
  const block = { id: crypto.randomUUID(), type: blockType, data: def ? defaultsForSchema(def.fields ?? {}) : {} };
  // Container blocks (groups) hold their own child blocks.
  if (def?.container) block.blocks = [];
  return block;
}

/** Child block types a group/container block accepts. */
export function childBlockTypes(blockType) {
  return blockDef(blockType)?.childTypes ?? [];
}

/** Default blocks for a freshly-created section (from `blockConfig.presets`). */
export function seedBlocks(sectionType) {
  const cfg = blockConfigForType(sectionType);
  if (!cfg?.presets?.length) return [];
  return cfg.presets.map((blockType) => makeBlock(sectionType, blockType));
}

export function isAtBlockMax(sectionType, blocks) {
  const max = blockConfigForType(sectionType)?.max;
  return max != null && (blocks?.length ?? 0) >= max;
}

// ── Compound selection id (section :: block [:: nested-block ...]) ───────
// `path` is an ordered array of block ids from the top-level block down to
// the selected block, so a block nested at any depth (group inside group,
// inside group, …) is addressable, not just one level.
export function blockSelectionId(sectionId, path) {
  const ids = Array.isArray(path) ? path : [path];
  return ids.length ? `${sectionId}${SEP}${ids.join(SEP)}` : sectionId;
}

export function parseBlockSelection(selectionId) {
  if (typeof selectionId !== 'string' || !selectionId.includes(SEP)) return null;
  const [sectionId, ...path] = selectionId.split(SEP);
  return { sectionId, path, blockId: path[0] ?? null, childId: path.length > 1 ? path[path.length - 1] : null };
}

/** Find the chain of block objects (top-level → deepest) addressed by `path`. */
export function resolveBlockPath(blocks, path) {
  const chain = [];
  let list = blocks ?? [];
  for (const id of path ?? []) {
    const b = list.find((x) => x.id === id);
    if (!b) return null;
    chain.push(b);
    list = b.blocks ?? [];
  }
  return chain;
}

/** The blocks array living at a given container path (path=[] → top level). */
export function blocksAtPath(blocks, path) {
  let list = blocks ?? [];
  for (const id of path ?? []) {
    const b = list.find((x) => x.id === id);
    if (!b) return [];
    list = b.blocks ?? [];
  }
  return list;
}

/**
 * Builds the on-canvas block interaction context handed to BlockStream, at
 * `prefixPath` within `sectionId` (top-level: prefixPath=[]). Recurses to any
 * nesting depth via `.childCtxFor(blockId)` — each level derives its own ctx
 * from the same `selPath` (the full selection path within this section), so a
 * group nested inside a group inside a group still gets working
 * select/edit/add without bespoke per-depth wiring.
 */
export function createBlockCtx(sectionId, prefixPath, selPath, opts) {
  const depth = prefixPath.length;
  // Selection ends exactly at this level (no deeper nesting selected).
  const selectedHere = selPath.length === depth + 1 ? selPath[depth] : null;
  return {
    selectedBlockId: selectedHere,
    atMax: opts.atMax,
    sectionActive: opts.sectionActive,
    onSelect: (blockId) => opts.onSelectBlock(sectionId, [...prefixPath, blockId]),
    onEdit: (blockId, key, value) => opts.onBlockInlineEdit(sectionId, [...prefixPath, blockId], key, value),
    onAdd: (blockType, index) => opts.onAddBlock(sectionId, blockType, index, prefixPath),
    childCtxFor: (blockId) =>
      createBlockCtx(sectionId, [...prefixPath, blockId], selPath, { ...opts, atMax: false }),
  };
}
