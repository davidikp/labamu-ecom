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
    { id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {}, hiddenFromNav: false, ...visibilityDefaults },
    {
      // Product/Collection are detail-page templates (parameterized slugs) —
      // not real, clickable nav destinations, so they default hidden from
      // nav (defaultNavLinksFromPages below also excludes any ":"-templated
      // slug as a second safeguard).
      id: 'product', name: 'Product', type: 'system', slug: '/products/:handle', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [
        defaultSection('product-default-spotlight', 'product_spotlight', {
          show_variant_selector: false,
          show_quantity_selector: false,
        }),
      ],
    },
    {
      id: 'collection', name: 'Collection', type: 'system', slug: '/collections/:handle', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [
        defaultSection('collection-default-grid', 'featured_products', {
          heading: 'Collection',
          show_view_all: false,
        }),
      ],
    },
    {
      // Cart/Checkout are reachable via the header's cart icon, not a
      // textual nav link, so they default hidden from nav too.
      id: 'cart', name: 'Cart', type: 'system', slug: '/cart', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [defaultSection('cart-default-summary', 'cart_summary')],
    },
    {
      id: 'checkout', name: 'Checkout', type: 'system', slug: '/checkout', seo: {}, hiddenFromNav: true,
      ...visibilityDefaults,
      sections: [defaultSection('checkout-default-summary', 'checkout_summary')],
    },
  ];
}

/** Nav links auto-derived from a page list — used to pre-fill the header's
 * Nav links field so it isn't empty by default (US follow-up to Epic 5/11).
 * Only pages meant to be top-nav destinations qualify: not hidden-from-nav,
 * and not a parameterized detail-page template (e.g. "/products/:handle"). */
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
 * `pages`, when supplied, pre-fills the header's Nav links with one entry
 * per nav-eligible page (see defaultNavLinksFromPages) so a fresh site's
 * header isn't left with an empty nav list — merchants can still add,
 * remove, or reorder links afterward exactly as before.
 */
export function createDefaultGlobals(pages = []) {
  const navLinks = defaultNavLinksFromPages(pages);
  return {
    header: {
      id: 'header',
      type: 'header',
      hidden: false,
      data: { ...defaultsForSchema(headerSchema), ...(navLinks.length ? { nav_links: navLinks } : {}) },
    },
    footer: { id: 'footer', type: 'footer', hidden: false, data: defaultsForSchema(footerSchema) },
  };
}
