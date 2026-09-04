/**
 * @module section-builder/state/migrations
 * @description One-time, idempotent upgrades applied to any persisted draft or
 * published state when it's loaded (see storage.js).
 *   1. Fold legacy per-field `repeater` arrays (e.g. `data.quotes`) into the
 *      unified `section.blocks` model.
 *   2. Fold legacy fixed content fields of content sections (e.g. a Hero's
 *      `heading`/`subtext`/`button_label`) into content blocks.
 * Safe to run repeatedly — migrated sections have their legacy keys stripped,
 * so a second pass is a no-op.
 */
import { SECTION_DEFINITIONS } from '../sections/index';
import { defaultsForSchema } from '../sections/schemaDefaults';
import { blockDef } from '../sections/blocks/registry';
import { DEFAULT_COLLECTIONS_BY_STYLE, defaultCollectionItems } from '../sections/collection_list/schema';
import { DEFAULT_PRODUCT_IDS, defaultProductItems } from '../sections/featured_products/schema';
import catalogMock from '../mocks/catalog.json';

function mk(type, data) {
  const def = blockDef(type);
  return { id: crypto.randomUUID(), type, data: { ...defaultsForSchema(def?.fields ?? {}), ...data } };
}

// Field → block builders for content sections. Each returns the blocks to
// create from legacy `data`, plus the data keys to strip.
const CONTENT_MIGRATORS = {
  hero_banner: (d) => ({
    keys: ['heading', 'subtext', 'button_label', 'button_url'],
    blocks: [
      d.heading != null && mk('heading', { text: d.heading }),
      d.subtext ? mk('subheading', { text: d.subtext }) : null,
      d.button_label ? mk('button', { label: d.button_label, url: d.button_url ?? '' }) : null,
    ],
  }),
  image_with_text: (d) => ({
    keys: ['eyebrow_label', 'heading', 'body_text', 'show_button', 'button_label'],
    blocks: [
      d.eyebrow_label ? mk('subheading', { text: d.eyebrow_label }) : null,
      d.heading != null && mk('heading', { text: d.heading }),
      d.body_text ? mk('text', { content: d.body_text }) : null,
      d.button_label ? mk('button', { label: d.button_label }) : null,
    ],
  }),
  rich_text: (d) => ({
    keys: ['content'],
    blocks: [d.content ? mk('text', { content: d.content }) : null],
  }),
  video_banner: (d) => ({
    keys: ['heading', 'subtext', 'button_label', 'button_url'],
    blocks: [
      d.heading != null && mk('heading', { text: d.heading }),
      d.subtext ? mk('subheading', { text: d.subtext }) : null,
      d.button_label ? mk('button', { label: d.button_label, url: d.button_url ?? '' }) : null,
    ],
  }),
  newsletter_signup: (d) => ({
    keys: ['heading', 'subtext'],
    blocks: [
      d.heading != null && mk('heading', { text: d.heading }),
      d.subtext ? mk('text', { content: d.subtext }) : null,
    ],
  }),
  countdown_timer: (d) => ({
    keys: ['heading', 'subtext'],
    blocks: [
      d.heading != null && mk('heading', { text: d.heading }),
      d.subtext ? mk('subheading', { text: d.subtext }) : null,
    ],
  }),
  promotional_banner: (d) => ({
    keys: ['heading', 'message', 'button_label', 'button_url'],
    blocks: [
      d.heading != null && mk('heading', { text: d.heading }),
      d.message ? mk('text', { content: d.message }) : null,
      d.button_label ? mk('button', { label: d.button_label, url: d.button_url ?? '' }) : null,
    ],
  }),
  announcement_bar: (d) => ({
    keys: ['message', 'show_link', 'link_label', 'link_url'],
    blocks: [mk('announcement', { message: d.message ?? '', link_label: d.link_label ?? '', link_url: d.link_url ?? '' })],
  }),
  contact_form: (d) => ({
    keys: ['heading', 'subtext'],
    blocks: [
      d.heading != null && mk('heading', { text: d.heading }),
      d.subtext ? mk('text', { content: d.subtext }) : null,
      mk('form_field', { label: 'Name', field_type: 'text' }),
      mk('form_field', { label: 'Email', field_type: 'email' }),
      mk('form_field', { label: 'Message', field_type: 'textarea' }),
    ],
  }),
};

// (3) collection_list's `collections` field didn't exist before it — old
// saved sections have `data.collections` literally undefined, not `[]`.
// Renderer.jsx's "show everything" fallback covers that case at render
// time, but the settings panel reads real data and shows an empty
// repeater — a mismatch. Backfilling the real default here (once, on
// load) fixes both at once instead of leaving the fallback as the
// permanent story. Only fires when the key is truly absent — an
// explicit `[]` (merchant deliberately emptied the list) is left alone.
function migrateCollectionListDefaults(section) {
  if (section?.type !== 'collection_list' || section.data?.collections != null) return section;
  const style = section.data?.display_style ?? 'cards';
  const handles = DEFAULT_COLLECTIONS_BY_STYLE[style] ?? DEFAULT_COLLECTIONS_BY_STYLE.cards;
  return { ...section, data: { ...section.data, collections: defaultCollectionItems(handles) } };
}

// (4) featured_products' `products` field didn't exist before it either —
// same mismatch as collection_list, plus a second wrinkle: the old
// section-wide source_mode ('dynamic' | 'manual') meant a section's real
// content was either the removed source/collection_handle/products_to_show
// fields (dynamic) or its 'product' blocks (manual) — never both. Whichever
// one this section actually used gets folded into `products`; the loser
// (blocks, if dynamic; the removed fields, if manual) is dropped.
function migrateFeaturedProductsDefaults(section) {
  if (section?.type !== 'featured_products' || section.data?.products != null) return section;
  const data = section.data ?? {};
  const hasProductBlocks = Array.isArray(section.blocks) && section.blocks.some((b) => b.type === 'product');

  let items;
  if (data.source_mode === 'manual' && hasProductBlocks) {
    items = section.blocks
      .filter((b) => b.type === 'product')
      .map((b) => ({ id: b.id, source: 'custom', title: b.data?.title ?? '', image: b.data?.image ?? null, price: b.data?.price ?? '', url: b.data?.url ?? '' }));
  } else {
    const count = data.products_to_show ?? 4;
    const collection = data.source === 'collection' ? catalogMock.collections.find((c) => c.handle === (data.collection_handle ?? 'best-sellers')) : null;
    items = defaultProductItems((collection ? collection.productIds : DEFAULT_PRODUCT_IDS).slice(0, count));
  }

  const { source_mode: _source_mode, source: _source, collection_handle: _collection_handle, products_to_show: _products_to_show, ...restData } = data;
  const blocks = Array.isArray(section.blocks) ? section.blocks.filter((b) => b.type !== 'product') : section.blocks;
  return { ...section, data: { ...restData, products: items }, blocks };
}

function migrateSection(section) {
  section = migrateCollectionListDefaults(section);
  section = migrateFeaturedProductsDefaults(section);

  const type = section?.type;
  const cfg = SECTION_DEFINITIONS[type]?.blockConfig;
  if (!cfg) return section;

  // (1) Repeater → blocks (sections that declared a legacyDataKey).
  const legacyKey = cfg.legacyDataKey;
  const legacyItems = legacyKey ? section.data?.[legacyKey] : null;
  const hasLegacyRepeater = Array.isArray(legacyItems);

  // (2) Content fields → blocks (content sections). Only when this section
  // has never been blockified (no blocks array) — avoids clobbering edits.
  const contentMigrator = CONTENT_MIGRATORS[type];
  const needsContentMigration = contentMigrator && !Array.isArray(section.blocks);

  if (Array.isArray(section.blocks) && !hasLegacyRepeater && !needsContentMigration) return section;

  let blocks = section.blocks ?? [];
  const data = { ...section.data };

  if (hasLegacyRepeater) {
    const blockType = (cfg.allowed ?? [])[0];
    blocks = [
      ...blocks,
      ...legacyItems.map((item) => {
        const { id, ...rest } = item ?? {};
        return { id: id ?? crypto.randomUUID(), type: blockType, data: rest };
      }),
    ];
    delete data[legacyKey];
  }

  if (needsContentMigration) {
    const { keys, blocks: made } = contentMigrator(data);
    blocks = [...blocks, ...made.filter(Boolean)];
    keys.forEach((k) => delete data[k]);
  }

  return { ...section, data, blocks };
}

export function migrateState(state) {
  if (!state || !Array.isArray(state.pages)) return state;
  return {
    ...state,
    pages: state.pages.map((page) => ({
      ...page,
      sections: (page.sections ?? []).map(migrateSection),
    })),
  };
}
