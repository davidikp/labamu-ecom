import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';
import { IMAGE_ASPECT_RATIO_FIELD } from '../shared/imageAspectRatio';
import { SOURCE_FIELD, DEPENDS_ON_CATALOG_SOURCE, DEPENDS_ON_CUSTOM_SOURCE } from '../shared/sourceBinding';
import catalog from '../../mocks/catalog.json';

// Derived from the catalog mock rather than hand-listed — this select
// covers all 14 products as of writing, and would silently drift out of
// sync with mocks/catalog.json if it were a static, hand-authored list
// (the pitfall collection_list's CATALOG_HANDLE_OPTIONS chose to accept
// since collections change far less often).
const PRODUCT_OPTIONS = catalog.products.map((p) => ({ value: p.id, label: p.name }));

// Exported for migrations.js — backfilling `products` for sections saved
// before this field existed.
export const DEFAULT_PRODUCT_IDS = catalog.products.slice(0, 4).map((p) => p.id);

export function defaultProductItems(productIds) {
  return productIds.map((id) => ({ id: `fp-default-${id}`, source: 'catalog', product_id: id }));
}

/** US-11.C1 — Featured Products. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Featured products', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  ...HEADING_SIZE_FIELD,
  // Each item picks its own source — a real catalog product, or fully
  // custom content — replacing the old section-wide "From a source /
  // Manual blocks" toggle (and the 'product' block type it drove, which
  // sat in the settings panel independent of source_mode and could show
  // blocks the canvas wasn't actually rendering). Mirrors collection_list's
  // `collections` field — see that schema.js for the fuller rationale.
  products: {
    type: 'repeater', label: 'Products', group: 'content',
    maxItems: 12,
    default: defaultProductItems(DEFAULT_PRODUCT_IDS),
    itemSchema: {
      source: SOURCE_FIELD,
      product_id: {
        type: 'select', label: 'Product',
        dependsOn: DEPENDS_ON_CATALOG_SOURCE,
        options: PRODUCT_OPTIONS,
      },
      title: { type: 'text', label: 'Title', maxLength: 100, default: '', dependsOn: DEPENDS_ON_CUSTOM_SOURCE },
      image: { type: 'image', label: 'Image', dependsOn: DEPENDS_ON_CUSTOM_SOURCE },
      price: { type: 'text', label: 'Price', maxLength: 40, default: '', dependsOn: DEPENDS_ON_CUSTOM_SOURCE },
      url: { type: 'text', label: 'Link URL', default: '', dependsOn: DEPENDS_ON_CUSTOM_SOURCE },
    },
  },
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '4', group: 'layout',
    options: [
      { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' },
      { value: '5', label: '5' }, { value: '6', label: '6' },
    ],
  },
  columns_mobile: {
    type: 'select', label: 'Columns on mobile', default: '2', group: 'mobile',
    options: [{ value: '1', label: '1' }, { value: '2', label: '2' }],
  },
  mobile_layout: {
    type: 'select', label: 'Mobile layout', default: 'grid', group: 'mobile',
    helpText: 'Grid wraps products into rows. Horizontal scroll shows one row that swipes sideways — useful for a wide desktop grid (e.g. 6 columns) that would otherwise wrap awkwardly on a phone.',
    options: [{ value: 'grid', label: 'Grid' }, { value: 'horizontal_scroll', label: 'Horizontal scroll' }],
  },
  show_price: { type: 'boolean', label: 'Show price', default: true, group: 'layout' },
  show_view_all: { type: 'boolean', label: 'Show "View all" link', default: true, group: 'layout' },
  show_quick_add: { type: 'boolean', label: 'Show quick "Add to cart" button', default: false, group: 'layout' },
  group_by_category: { type: 'boolean', label: 'Group into rows by category', default: false, group: 'layout' },
  ...IMAGE_ASPECT_RATIO_FIELD,
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

// No block support anymore — custom items are now authored inline per
// repeater item (source: 'custom') instead of via separate 'product' blocks
// in manual mode.
export const blockConfig = { allowed: [], presets: [], max: 0 };
