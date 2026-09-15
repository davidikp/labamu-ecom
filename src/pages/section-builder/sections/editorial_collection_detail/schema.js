import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Matches builderReducer.js's REQUIRED_SECTION_ID_BY_SYSTEM_TYPE pattern —
 * blocks this section from being deleted off the Editorial Collection Detail
 * system page, same as SHOP_CORE_SECTION_ID/PRODUCT_CORE_SECTION_ID. */
export const EDITORIAL_COLLECTION_DETAIL_CORE_SECTION_ID = 'editorial-collection-detail-story';

/**
 * Editorial Collection Detail — the storefront's single, shared template
 * for every editorial Collection (see sections/shared/editorialCollections.js).
 * Fixed structure per this feature's MVP scope (introduction, hero image,
 * gallery, optional CTA) — only presentation/styling is merchant-configurable,
 * not structure; content (title/subtitle/description/images/CTA) always comes
 * from the resolved collection, exactly like product_detail always reflects
 * the routed product rather than merchant-picked content.
 */
// One strongly opinionated editorial rhythm (introduction -> hero -> full/
// pair gallery with story blocks/captions woven in -> CTA, see Renderer.jsx)
// — deliberately not a merchant choice among several gallery templates,
// per this feature's product decision. There is therefore no
// `gallery_layout` field; only visibility/chrome are configurable.
export const schema = {
  show_subtitle: { type: 'boolean', label: 'Show subtitle', default: true, group: 'layout' },
  show_description: { type: 'boolean', label: 'Show description', default: true, group: 'layout' },
  show_cta: { type: 'boolean', label: 'Show CTA', default: true, group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 56 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 56 },
};

export const blockConfig = { allowed: [], presets: [], max: 0 };
