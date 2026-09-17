import { rawSchema } from './themeSchemaAdapter';
import { schema as headerSchema } from '../sections/header/schema';
import { schema as footerSchema } from '../sections/footer/schema';
import { defaultsForSchema } from '../sections/schemaDefaults';
import { schemaForType } from '../sections/index';

function defaultSection(id, type, overrides = {}) {
  return { id, type, data: { ...defaultsForSchema(schemaForType(type)), ...overrides } };
}

/**
 * @module section-builder/state/defaultTheme
 * @description Default theme values, derived directly from
 * theme-settings-schema.json's field defaults (single source of truth as of
 * Phase 4) — no more hand-duplicated values to drift out of sync.
 */
function defaultsForGroup(groupKey) {
  const fields = rawSchema.groups[groupKey].fields;
  return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.default]));
}

export const defaultTheme = {
  typography: defaultsForGroup('typography'),
  colors: defaultsForGroup('colors'),
  buttons: defaultsForGroup('buttons'),
  layout: defaultsForGroup('layout'),
  product_cards: defaultsForGroup('product_cards'),
};

/**
 * System pages (US-6.1). Product/Collection/Cart/Checkout are seeded with a
 * starter section (a minimal PDP spotlight, a collection grid, and cart/
 * checkout summaries) so they aren't blank, but they still pull from the
 * mock catalog fixture (mocks/catalog.json), not a real backend — see
 * TODO(catalog integration) notes in the section renderers themselves.
 * All five pages are section-editable like Home; merchants can add, remove,
 * or rearrange sections on any of them.
 */
/**
 * System-page "kinds", distinct from `type: 'system'` (which only means
 * "not a merchant-authored custom page"). `systemType` names *what* the page
 * is for, independent of its `id` (which stays a stable primary key) — Shop
 * (full catalog) vs Collection (filtered subset) vs Product (single item)
 * are three different kinds even though all three are catalog-facing.
 * `REQUIRED_SYSTEM_TYPES` are the kinds Phase 1's Shop+PDP integration
 * depends on existing on every site (see mergeRequiredSystemPages below and
 * the delete-guard in builderReducer.js) — Cart/Checkout/Collection aren't
 * required yet, so they aren't in this list (no behavior change for them).
 */
/** Written-policy page kinds (Settings > Policies). Each is a reserved,
 * always-present system page whose `content` (rich-text HTML) is authored
 * from Settings > Policies (and, badged "Policy", from Online Store > Pages)
 * — name and slug are locked (see UPDATE_PAGE's guard in builderReducer.js),
 * only `content` is editable. Included in REQUIRED_SYSTEM_TYPES so they are
 * both auto-seeded (mergeRequiredSystemPages, same call sites as Shop/
 * Product) and delete-protected for free. */
export const POLICY_SYSTEM_TYPES = [
  'policy_refund',
  'policy_privacy',
  'policy_terms',
  'policy_shipping',
  'policy_legal',
  'policy_contact',
];

export const REQUIRED_SYSTEM_TYPES = ['shop', 'product', ...POLICY_SYSTEM_TYPES];

export function createDefaultPages() {
  // Every default page also gets the Pages panel's page-level visibility
  // fields (distinct from hiddenFromNav, which only controls the header nav
  // link): visibility 'visible'|'hidden' plus an optional visibleFrom
  // epoch-ms timestamp for scheduled visibility, and an updatedAt stamp
  // bumped on every subsequent page mutation (see builderReducer.js).
  // `content` (rich-text HTML from the Page editor) is also seeded as an
  // empty string here so every page — including these system pages — always
  // carries the field; PagesManagement.jsx's Content column relies on this
  // to avoid a `sections`-based fallback.
  const visibilityDefaults = { visibility: 'visible', visibleFrom: null, updatedAt: Date.now(), content: '' };
  return [
    { id: 'home', name: 'Home', type: 'system', systemType: 'home', slug: '/', sections: [], seo: {}, hiddenFromNav: false, ...visibilityDefaults },
    {
      // Shop is the full-catalog browse page — a real, clickable nav
      // destination (unlike Product/Collection below), so it defaults
      // visible in nav.
      id: 'shop', name: 'Shop', type: 'system', systemType: 'shop', slug: '/shop', seo: {}, hiddenFromNav: false,
      ...visibilityDefaults,
      sections: [
        // 'shop-catalog' matches SHOP_CORE_SECTION_ID (catalog_list/schema.js)
        // — builderReducer.js's REMOVE_SECTION guard blocks deleting this
        // exact id off the Shop page, so it's kept a plain string literal
        // here (not the imported constant) to avoid a schema.js <->
        // defaultTheme.js import cycle; both are covered by tests.
        defaultSection('shop-catalog', 'catalog_list', { heading: 'Shop' }),
      ],
    },
    {
      // Product/Collection are detail-page templates (parameterized slugs) —
      // not real, clickable nav destinations, so they default hidden from
      // nav (defaultNavLinksFromPages below also excludes any ":"-templated
      // slug as a second safeguard).
      id: 'product', name: 'Product', type: 'system', systemType: 'product', slug: '/products/:handle', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [
        // 'product-default-detail' matches PRODUCT_CORE_SECTION_ID
        // (product_detail/schema.js) — builderReducer.js's REMOVE_SECTION
        // guard blocks deleting this exact id off the Product page, same
        // pattern as 'shop-catalog' above; kept a plain string literal here
        // to avoid a schema.js <-> defaultTheme.js import cycle.
        defaultSection('product-default-detail', 'product_detail'),
      ],
    },
    {
      id: 'collection', name: 'Collection', type: 'system', systemType: 'collection', slug: '/collections/:handle', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [
        defaultSection('collection-default-grid', 'featured_products', {
          heading: 'Collection',
          show_view_all: false,
        }),
      ],
    },
    {
      // Editorial Collection List (seeded for every NEW site, like Home/Shop,
      // but — unlike Shop/Product — not in REQUIRED_SYSTEM_TYPES: it stays
      // an optional page a merchant can hide or remove, and existing drafts
      // saved before this page existed are never backfilled with it (see
      // mergeRequiredSystemPages below, only applied to REQUIRED_SYSTEM_TYPES).
      // A real, clickable nav destination like Shop, so it defaults visible.
      id: 'editorial-collection-list', name: 'Collection', type: 'system', systemType: 'editorial_collection_list', slug: '/collection', seo: {}, hiddenFromNav: false,
      ...visibilityDefaults,
      sections: [
        // 'editorial-collection-list-grid' matches
        // EDITORIAL_COLLECTION_LIST_CORE_SECTION_ID (editorial_collection_list/schema.js).
        defaultSection('editorial-collection-list-grid', 'editorial_collection_list', {}),
      ],
    },
    {
      // Editorial Collection Detail — the parameterized template every
      // editorial Collection (see sections/shared/editorialCollections.js)
      // renders through, following Product Detail's architecture exactly
      // (single shared system page, resolved-by-slug content, hidden from
      // nav, core section undeletable — see builderReducer.js). Also
      // deliberately NOT in REQUIRED_SYSTEM_TYPES: Shop+Product are the only
      // pair bundled as required, and since Collection List above must stay
      // optional, Collection Detail follows it rather than Product (there is
      // no existing precedent for a required detail page paired with an
      // optional list page).
      id: 'editorial-collection-detail', name: 'Collection Detail', type: 'system', systemType: 'editorial_collection_detail', slug: '/collection/:slug', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [
        // 'editorial-collection-detail-story' matches
        // EDITORIAL_COLLECTION_DETAIL_CORE_SECTION_ID (editorial_collection_detail/schema.js).
        defaultSection('editorial-collection-detail-story', 'editorial_collection_detail', {}),
      ],
    },
    {
      // Cart/Checkout are reachable via the header's cart icon, not a
      // textual nav link, so they default hidden from nav too.
      id: 'cart', name: 'Cart', type: 'system', systemType: 'cart', slug: '/cart', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [defaultSection('cart-default-summary', 'cart_summary')],
    },
    {
      id: 'checkout', name: 'Checkout', type: 'system', systemType: 'checkout', slug: '/checkout', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [defaultSection('checkout-default-summary', 'checkout_summary')],
    },
    // Written policies (Settings > Policies). No sections — just a rich-text
    // `content` body, rendered the same way PagePreview.jsx renders any
    // merchant page's content. Hidden from nav by default: they're surfaced
    // via the footer/Menus, not the main nav, same as Cart/Checkout. Edited
    // through PolicyEditorModal.jsx's per-row modal (not the full Page
    // editor) from Settings > Policies; still reachable/editable from
    // Online Store > Pages (badged "Policy") via the full Page editor too.
    { id: 'policy-refund', name: 'Return & refund policy', type: 'system', systemType: 'policy_refund', slug: '/policies/refund-policy', seo: {}, hiddenFromNav: true, sections: [], ...visibilityDefaults },
    // `automated: true` — Privacy defaults to an auto-generated policy (see
    // policyTemplates.js's buildAutomatedPrivacyPolicy), matching Shopify's
    // own default. Toggling "Use automated policy" off in the modal flips
    // this to false and the content becomes freely editable, same as every
    // other policy.
    { id: 'policy-privacy', name: 'Privacy policy', type: 'system', systemType: 'policy_privacy', slug: '/policies/privacy-policy', seo: {}, hiddenFromNav: true, sections: [], automated: true, ...visibilityDefaults },
    { id: 'policy-terms', name: 'Terms of service', type: 'system', systemType: 'policy_terms', slug: '/policies/terms-of-service', seo: {}, hiddenFromNav: true, sections: [], ...visibilityDefaults },
    { id: 'policy-shipping', name: 'Shipping policy', type: 'system', systemType: 'policy_shipping', slug: '/policies/shipping-policy', seo: {}, hiddenFromNav: true, sections: [], ...visibilityDefaults },
    { id: 'policy-legal', name: 'Legal notice', type: 'system', systemType: 'policy_legal', slug: '/policies/legal-notice', seo: {}, hiddenFromNav: true, sections: [], ...visibilityDefaults },
    // Contact information — a written policy like the other five (rich-text
    // body, same modal), not a link out to Business Information; Shopify's
    // own Settings > Policies treats it identically to Refund/Privacy/etc.
    { id: 'policy-contact', name: 'Contact information', type: 'system', systemType: 'policy_contact', slug: '/policies/contact-information', seo: {}, hiddenFromNav: true, sections: [], ...visibilityDefaults },
  ];
}

/** Identifies whether `page` already fills the semantic role `systemType` —
 * matches on the explicit `systemType` field when present, and falls back to
 * `id` for legacy pages (pre-Phase-1 saved drafts, and template-authored
 * pages in siteTemplates.js) that predate that field but happen to reuse the
 * same reserved id (`'shop'`/`'product'`/...). */
function pageFillsSystemType(page, systemType) {
  return page?.systemType === systemType || page?.id === systemType;
}

/**
 * Deterministically merges a set of "required" system pages (e.g. Shop,
 * Product Detail) into a template- or draft-provided page list — never
 * duplicating a page that already fills that role, and never touching any
 * existing page (merchant-authored or otherwise). Missing required pages
 * are appended, in `requiredPages`'s own order, after everything already in
 * `pages`. Idempotent: calling it twice with the same inputs produces the
 * same result.
 */
export function mergeRequiredSystemPages(pages, requiredPages) {
  const existing = pages ?? [];
  const missing = (requiredPages ?? []).filter(
    (req) => !existing.some((page) => pageFillsSystemType(page, req.systemType))
  );
  return missing.length ? [...existing, ...missing] : existing;
}

/** The default page objects for every `REQUIRED_SYSTEM_TYPES` kind — used as
 * the `requiredPages` argument to `mergeRequiredSystemPages` by both
 * `APPLY_SITE_TEMPLATE_SEED` (builderReducer.js) and the draft-load hydration
 * path (useSectionBuilder.js), so a freshly-seeded template and an
 * old-saved-draft loaded today both end up with the same Shop/Product pages. */
export function requiredSystemPages() {
  return createDefaultPages().filter((page) => REQUIRED_SYSTEM_TYPES.includes(page.systemType));
}

/** Nav items auto-derived from a page list — used to pre-fill the "Main
 * menu" (US-Content.1; formerly the header's own inline Nav links field) so
 * it isn't empty by default (US follow-up to Epic 5/11). Only pages meant to
 * be top-nav destinations qualify: not hidden-from-nav, and not a
 * parameterized detail-page template (e.g. "/products/:handle"). */
function defaultNavLinksFromPages(pages) {
  return pages
    .filter((page) => !page.hiddenFromNav && typeof page.slug === 'string' && !page.slug.includes(':'))
    .map((page) => ({ id: `nav-${page.id}`, label: page.name, url: page.slug }));
}

/**
 * Header and footer are global singletons present on every store from
 * creation (US-3.6) — never absent, so there's no "add" flow for them,
 * only a hide toggle.
 *
 * `pages`, when supplied, pre-fills the "Main menu" (`menus['main-menu']`)
 * with one entry per nav-eligible page (see defaultNavLinksFromPages) so a
 * fresh site's header isn't left pointing at an empty menu — merchants can
 * still add, remove, or reorder links afterward via Content > Menus exactly
 * as before (previously via the header's own Nav links field).
 */
export function createDefaultGlobals(pages = []) {
  const navLinks = defaultNavLinksFromPages(pages);
  return {
    header: { id: 'header', type: 'header', hidden: false, data: defaultsForSchema(headerSchema) },
    footer: { id: 'footer', type: 'footer', hidden: false, data: defaultsForSchema(footerSchema) },
    menus: {
      'main-menu': { id: 'main-menu', name: 'Header Menu', items: navLinks },
      'footer-menu': { id: 'footer-menu', name: 'Footer menu', items: [] },
    },
  };
}
