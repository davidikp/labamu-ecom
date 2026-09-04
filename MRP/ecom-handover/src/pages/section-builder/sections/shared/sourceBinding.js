/**
 * @module section-builder/sections/shared/sourceBinding
 * @description Shared `source` field for a repeater item that either binds
 * to a real catalog entity (product, collection, …) or holds fully custom
 * content — the section-builder's existing "external data binding" idiom
 * (Phase 4 of the Easyblocks-inspired work). `featured_products/schema.js`
 * and `collection_list/schema.js` both hand-rolled an identical copy of this
 * field before it was extracted here; any future section binding a repeater
 * item to a catalog entity should reuse `SOURCE_FIELD` instead of
 * re-declaring it, so the `source` selector's shape (and its `catalog`/
 * `custom` values, which every `dependsOn: { field: 'source', ... }` in a
 * consuming schema keys off) stays in exactly one place.
 *
 * This only extracts the *schema* half of the pattern — each consumer's
 * catalog shape differs enough (a product's `product_id` vs. a collection's
 * `handle`, different result fields) that the *resolve* half (turning stored
 * items into render-ready objects, e.g. featured_products/Renderer.jsx's
 * `productsForSection` or collection_list/Renderer.jsx's
 * `collectionsForSection`) stays bespoke per section rather than being
 * forced into one shared resolver.
 */
export const SOURCE_FIELD = {
  type: 'select',
  label: 'Source',
  default: 'catalog',
  // Excluded from RepeaterField's item-summary fallback (which otherwise
  // shows the first select field's label) — "From catalog" isn't a useful
  // item summary the way the bound entity's own name/title is.
  excludeFromSummary: true,
  options: [
    { value: 'catalog', label: 'From catalog' },
    { value: 'custom', label: 'Custom' },
  ],
};

/** `dependsOn` shorthand for a field that only applies to catalog-bound items. */
export const DEPENDS_ON_CATALOG_SOURCE = { field: 'source', equals: 'catalog' };

/** `dependsOn` shorthand for a field that only applies to custom (unbound) items. */
export const DEPENDS_ON_CUSTOM_SOURCE = { field: 'source', equals: 'custom' };
