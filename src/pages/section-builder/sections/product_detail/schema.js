import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Matches SHOP_CORE_SECTION_ID's pattern (catalog_list/schema.js) — the
 * fixed id builderReducer.js's REMOVE_SECTION guard checks against to block
 * this section from being deleted off the Product system page (the PDP
 * would otherwise be deletable into a blank/arbitrary freeform page). Kept
 * a plain exported constant (not the defaultTheme.js literal) so both files
 * stay in sync; see state/defaultTheme.js and state/builderReducer.js.
 */
export const PRODUCT_CORE_SECTION_ID = 'product-default-detail';

/**
 * Product Detail — the storefront's real functional PDP: gallery + info
 * panel + description + related products (Xinear's Catalog Detail page /
 * Houzez's product page). Product data itself is resolved by the caller
 * (PreviewLive.jsx / ThemePreview.jsx, via
 * `resolveStorefrontProductByHandle`) from the route's `:handle`, NOT from
 * a merchant-picked `product_id` field — this section always reflects
 * whichever product the shopper navigated to. The only merchant-configurable
 * knobs are which optional blocks show, kept deliberately small so the
 * PDP's core structure can't be reconfigured into something else.
 */
// No product in this codebase's fixtures (mocks/catalog.json,
// mocks/houzezProducts.js) or in `productSource.js`'s normalized shape
// carries a `sku` field — there is no real SKU data anywhere to show or
// hide. Per this phase's explicit instruction not to fabricate data to
// make a setting "work", there is deliberately NO show_sku toggle and NO
// SKU row rendered anywhere in this section; see Renderer.jsx.
export const schema = {
  show_category: { type: 'boolean', label: 'Show category', default: true, group: 'layout' },
  show_stock_status: { type: 'boolean', label: 'Show in-stock / sold-out status', default: true, group: 'layout' },
  show_stock: { type: 'boolean', label: 'Show stock count', default: false, group: 'layout' },
  show_related_products: { type: 'boolean', label: 'Show related products', default: true, group: 'layout' },
  related_heading: { type: 'text', label: 'Related products heading', maxLength: 60, default: 'Other picks', group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
