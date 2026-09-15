import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/**
 * Catalog List — the Shop system page's core content: a filterable,
 * sortable, searchable, paginated product grid sourced from
 * `resolveStorefrontProducts(theme)` (see Renderer.jsx). This is the
 * smallest correct merchant-facing config surface for Phase 2: title,
 * products-per-page, and desktop column count. Category/price filter and
 * search are always-on functional features, not merchant-configurable
 * toggles — the golden reference (ShopPage.jsx) doesn't offer to hide them
 * either, and hiding them would leave a Shop page with no way to browse a
 * large catalog. Tablet/mobile column counts are fixed semantic tiers (3
 * and 2 respectively), not raw CSS, matching the golden reference exactly
 * (it only ever renders 2 or 4 columns, so tablet=3 is Phase 2's own
 * deliberate distinct middle tier — see Renderer.jsx).
 */
export const schema = {
  heading: { type: 'text', label: 'Shop title', maxLength: 60, default: 'Shop', group: 'content' },
  columns_desktop: {
    type: 'select', label: 'Columns (desktop)', default: 4, group: 'layout',
    options: [{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }],
  },
  page_size: {
    type: 'select', label: 'Products per page', default: 16, group: 'layout',
    options: [{ value: 8, label: '8' }, { value: 12, label: '12' }, { value: 16, label: '16' }, { value: 24, label: '24' }],
  },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

/** Designated "core" section id for the Shop system page (see
 * state/defaultTheme.js's Shop page seed) — used by builderReducer.js's
 * REMOVE_SECTION guard to block merchants from deleting the Shop page's
 * only catalog section, the section-level analogue of the page-level
 * required-system-page guard in mergeRequiredSystemPages/DELETE_PAGE. */
export const SHOP_CORE_SECTION_ID = 'shop-catalog';
