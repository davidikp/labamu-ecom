import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';
import { IMAGE_ASPECT_RATIO_FIELD } from '../shared/imageAspectRatio';

/** Matches builderReducer.js's REQUIRED_SECTION_ID_BY_SYSTEM_TYPE pattern —
 * blocks this section from being deleted off the Editorial Collection List
 * system page, same as SHOP_CORE_SECTION_ID/PRODUCT_CORE_SECTION_ID. Kept a
 * plain exported constant (not the defaultTheme.js literal) to avoid a
 * schema.js <-> defaultTheme.js import cycle; both are covered by tests. */
export const EDITORIAL_COLLECTION_LIST_CORE_SECTION_ID = 'editorial-collection-list-grid';

/**
 * Editorial Collection List — showcases multiple editorial Collections
 * (portfolios/lookbooks/campaigns, see sections/shared/editorialCollections.js)
 * as browsable cards linking to `/collection/:slug`. Deliberately distinct
 * from the existing `collection_list` section, which showcases *catalog*
 * collections (product handles) — this section never touches product data.
 * Configurable surface is intentionally small (heading/description/columns/
 * image ratio), same scale as catalog_list's schema — the grid itself isn't
 * meant to be reconfigured into something else.
 */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 100, default: 'Our Collections', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  description: { type: 'textarea', label: 'Description', maxLength: 300, default: '', group: 'content' },
  heading_alignment: {
    type: 'select', label: 'Heading alignment', default: 'left', group: 'content',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
  },
  ...HEADING_SIZE_FIELD,
  // 2 columns is the deliberate default — this is an editorial index, not a
  // dense inventory grid, and 2 columns gives each cover image far more
  // presence than 3 does (see Renderer.jsx). 3 stays available for a
  // merchant who wants a denser index.
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '2', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }],
  },
  ...IMAGE_ASPECT_RATIO_FIELD,
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 72 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 72 },
};

// No block support — cards are sourced entirely from the shared
// EDITORIAL_COLLECTIONS dataset, not authored per-instance.
export const blockConfig = { allowed: [], presets: [], max: 0 };
