import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';
import { IMAGE_ASPECT_RATIO_FIELD } from '../shared/imageAspectRatio';
import { SOURCE_FIELD, DEPENDS_ON_CATALOG_SOURCE, DEPENDS_ON_CUSTOM_SOURCE } from '../shared/sourceBinding';

const CATALOG_HANDLE_OPTIONS = [
  { value: 'best-sellers', label: 'Best Sellers' },
  { value: 'new-arrivals', label: 'New Arrivals' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'bags', label: 'Bags' },
  { value: 'perfumes', label: 'Perfumes' },
];

// Default handles per display style — used both as the live re-seed when a
// merchant switches styles (see display_style.defaultCollectionsByStyle,
// read generically by SectionBuilder.jsx's handleFieldChange) and to build
// the schema-level default below, so a *brand new* section (created fresh,
// not from a template) starts pre-populated with cards' defaults rather
// than an empty repeater — panel and canvas agree from the first render.
// Exported for migrations.js — backfilling `collections` for sections saved
// before this field existed needs the same defaults, keyed by whatever
// display_style that old section already has.
export const DEFAULT_COLLECTIONS_BY_STYLE = {
  cards: ['best-sellers', 'new-arrivals'],
  circular: ['tops', 'bottoms', 'dresses', 'shoes', 'bags', 'perfumes'],
};

export function defaultCollectionItems(handles) {
  return handles.map((handle) => ({ id: `cl-default-${handle}`, source: 'catalog', handle }));
}

/** US-11.C4 — Collection List. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Shop by category', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  ...HEADING_SIZE_FIELD,
  display_style: {
    type: 'select', label: 'Display style', default: 'cards', group: 'layout',
    options: [{ value: 'cards', label: 'Cards' }, { value: 'circular', label: 'Circular icons' }],
    defaultCollectionsByStyle: DEFAULT_COLLECTIONS_BY_STYLE,
  },
  // Each item picks its own source — a real catalog collection, or fully
  // custom content — replacing the old section-wide "From a source / Manual
  // blocks" toggle. Falls back to "show everything" in Renderer.jsx only
  // for sections saved before this field existed (data.collections
  // literally absent) — new sections always get a real default below, so
  // that fallback is legacy-compat, not the everyday path.
  collections: {
    type: 'repeater', label: 'Collections', group: 'content',
    maxItems: 12,
    default: defaultCollectionItems(DEFAULT_COLLECTIONS_BY_STYLE.cards),
    itemSchema: {
      // Declared first so it renders above the collection picker, per how
      // an item is actually filled in: choose the source, then either pick
      // a collection or fill in custom fields.
      source: SOURCE_FIELD,
      handle: {
        type: 'select', label: 'Collection',
        dependsOn: DEPENDS_ON_CATALOG_SOURCE,
        options: CATALOG_HANDLE_OPTIONS,
      },
      title: { type: 'text', label: 'Title', maxLength: 100, default: '', dependsOn: DEPENDS_ON_CUSTOM_SOURCE },
      image: { type: 'image', label: 'Image', dependsOn: DEPENDS_ON_CUSTOM_SOURCE },
      url: { type: 'text', label: 'Link URL', default: '', dependsOn: DEPENDS_ON_CUSTOM_SOURCE },
    },
  },
  // Only meaningful for 'cards' — 'circular' is always a single row of
  // fixed-size thumbnails (see Renderer.jsx), so these would otherwise sit
  // in the settings panel doing nothing, out of sync with the canvas.
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '3', group: 'layout',
    dependsOn: { field: 'display_style', equals: 'cards' },
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
  },
  columns_mobile: {
    type: 'select', label: 'Columns on mobile', default: '2', group: 'mobile',
    dependsOn: { field: 'display_style', equals: 'cards' },
    options: [{ value: '1', label: '1' }, { value: '2', label: '2' }],
  },
  show_collection_title: { type: 'boolean', label: 'Show collection title', default: true, group: 'layout' },
  ...IMAGE_ASPECT_RATIO_FIELD,
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

// No block support anymore — custom items are now authored inline per
// repeater item (source: 'custom') instead of via separate 'collection'
// blocks in manual mode.
export const blockConfig = { allowed: [], presets: [], max: 0 };
