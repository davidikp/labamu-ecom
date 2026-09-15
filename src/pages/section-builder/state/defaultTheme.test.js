import { describe, it, expect } from 'vitest';
import {
  defaultTheme,
  createDefaultPages,
  createDefaultGlobals,
  mergeRequiredSystemPages,
  requiredSystemPages,
  REQUIRED_SYSTEM_TYPES,
} from './defaultTheme';

describe('defaultTheme', () => {
  it('mirrors theme-settings-schema.json defaults for each group', () => {
    expect(defaultTheme.colors.primary).toBe('#1a1a1a');
    expect(defaultTheme.typography.heading_font).toBe('Inter');
    expect(defaultTheme.buttons.corner_radius).toBe(4);
    expect(defaultTheme.layout.section_spacing).toBe('medium');
    expect(defaultTheme.product_cards.sale_badge_style).toBe('percent');
  });
});

describe('createDefaultPages', () => {
  it('hides parameterized detail pages and cart/checkout from nav, keeps Home and Shop visible', () => {
    const pages = createDefaultPages();
    const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
    expect(byId.home.hiddenFromNav).toBe(false);
    expect(byId.shop.hiddenFromNav).toBe(false);
    expect(byId.product.hiddenFromNav).toBe(true);
    expect(byId.collection.hiddenFromNav).toBe(true);
    expect(byId.cart.hiddenFromNav).toBe(true);
    expect(byId.checkout.hiddenFromNav).toBe(true);
    // Editorial Collection List is a real nav destination (like Shop);
    // Editorial Collection Detail is a parameterized template (like Product).
    expect(byId['editorial-collection-list'].hiddenFromNav).toBe(false);
    expect(byId['editorial-collection-detail'].hiddenFromNav).toBe(true);
  });

  it('tags every system page with a stable systemType', () => {
    const byId = Object.fromEntries(createDefaultPages().map((p) => [p.id, p]));
    expect(byId.home.systemType).toBe('home');
    expect(byId.shop.systemType).toBe('shop');
    expect(byId.product.systemType).toBe('product');
    expect(byId.collection.systemType).toBe('collection');
    expect(byId.cart.systemType).toBe('cart');
    expect(byId.checkout.systemType).toBe('checkout');
    expect(byId['editorial-collection-list'].systemType).toBe('editorial_collection_list');
    expect(byId['editorial-collection-detail'].systemType).toBe('editorial_collection_detail');
  });

  it('gives Shop and Product Detail the expected slugs', () => {
    const byId = Object.fromEntries(createDefaultPages().map((p) => [p.id, p]));
    expect(byId.shop.slug).toBe('/shop');
    expect(byId.product.slug).toBe('/products/:handle');
  });

  it('gives Editorial Collection List and Detail the expected slugs', () => {
    const byId = Object.fromEntries(createDefaultPages().map((p) => [p.id, p]));
    expect(byId['editorial-collection-list'].slug).toBe('/collection');
    expect(byId['editorial-collection-detail'].slug).toBe('/collection/:slug');
  });

  it('seeds Editorial Collection List/Detail for every new site (available by default, but not required)', () => {
    const systemTypes = createDefaultPages().map((p) => p.systemType);
    expect(systemTypes).toContain('editorial_collection_list');
    expect(systemTypes).toContain('editorial_collection_detail');
  });
});

describe('requiredSystemPages / REQUIRED_SYSTEM_TYPES', () => {
  it('is exactly Shop + Product Detail — Editorial Collection List/Detail stay optional, like Cart/Checkout/Collection', () => {
    expect(REQUIRED_SYSTEM_TYPES).toEqual(['shop', 'product']);
    expect(requiredSystemPages().map((p) => p.systemType).sort()).toEqual(['product', 'shop']);
  });

  it('does not backfill Editorial Collection List/Detail into an existing draft missing them', () => {
    // Regression guard for the approved plan's decision #1: optional seeded
    // pages (cart/checkout/collection/editorial_collection_*) are only ever
    // added via createDefaultPages() for a brand-new site, never merged into
    // an existing draft the way REQUIRED_SYSTEM_TYPES pages are.
    const existing = [{ id: 'home', name: 'Home', type: 'system', systemType: 'home', slug: '/' }];
    const merged = mergeRequiredSystemPages(existing, requiredSystemPages());
    expect(merged.map((p) => p.systemType)).not.toContain('editorial_collection_list');
    expect(merged.map((p) => p.systemType)).not.toContain('editorial_collection_detail');
  });
});

describe('mergeRequiredSystemPages', () => {
  it('appends missing required pages without touching existing ones', () => {
    const existing = [{ id: 'home', name: 'Home', type: 'system', systemType: 'home', slug: '/' }];
    const merged = mergeRequiredSystemPages(existing, requiredSystemPages());
    expect(merged[0]).toBe(existing[0]);
    expect(merged.map((p) => p.id)).toEqual(['home', 'shop', 'product']);
  });

  it('never duplicates a page that already fills a required role, whether by systemType or legacy id', () => {
    const existing = [
      { id: 'home', name: 'Home', type: 'system', systemType: 'home', slug: '/' },
      { id: 'shop', name: 'Shop', type: 'system', systemType: 'shop', slug: '/shop' },
      // Legacy page: predates the `systemType` field, but its id is already
      // the reserved 'product' key.
      { id: 'product', name: 'Product', type: 'system', slug: '/products/:handle' },
    ];
    const merged = mergeRequiredSystemPages(existing, requiredSystemPages());
    expect(merged).toHaveLength(3);
    expect(merged).toBe(existing);
  });

  it('is idempotent — merging twice produces the same result as merging once', () => {
    const once = mergeRequiredSystemPages([{ id: 'home', type: 'system', systemType: 'home', slug: '/' }], requiredSystemPages());
    const twice = mergeRequiredSystemPages(once, requiredSystemPages());
    expect(twice.map((p) => p.id)).toEqual(once.map((p) => p.id));
    expect(twice).toHaveLength(3);
  });

  it('leaves merchant/custom pages fully intact', () => {
    const existing = [
      { id: 'home', type: 'system', systemType: 'home', slug: '/' },
      { id: 'about', name: 'About', type: 'custom', slug: '/about', sections: ['s1'] },
    ];
    const merged = mergeRequiredSystemPages(existing, requiredSystemPages());
    expect(merged.find((p) => p.id === 'about')).toEqual(existing[1]);
  });
});

describe('createDefaultGlobals', () => {
  it('pre-fills the Main menu from nav-eligible pages only (Home, Shop, and Editorial Collection List)', () => {
    const { menus } = createDefaultGlobals(createDefaultPages());
    expect(menus['main-menu'].items).toEqual([
      { id: 'nav-home', label: 'Home', url: '/' },
      { id: 'nav-shop', label: 'Shop', url: '/shop' },
      { id: 'nav-editorial-collection-list', label: 'Collection', url: '/collection' },
    ]);
  });

  it('includes custom pages and other non-hidden static-slug pages', () => {
    const pages = [
      ...createDefaultPages(),
      { id: 'about', name: 'About', type: 'custom', slug: '/about', sections: [], seo: {}, hiddenFromNav: false },
    ];
    const { menus } = createDefaultGlobals(pages);
    expect(menus['main-menu'].items.map((l) => l.url)).toEqual(['/', '/shop', '/collection', '/about']);
  });

  it('leaves the Main menu empty when no pages are supplied (backward compatible)', () => {
    const { menus } = createDefaultGlobals();
    expect(menus['main-menu'].items).toEqual([]);
  });

  it('always seeds an empty Footer menu alongside the Main menu', () => {
    const { menus } = createDefaultGlobals(createDefaultPages());
    expect(menus['footer-menu']).toEqual({ id: 'footer-menu', name: 'Footer menu', items: [] });
  });
});
