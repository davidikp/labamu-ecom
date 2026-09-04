import { describe, it, expect } from 'vitest';
import { defaultTheme, createDefaultPages, createDefaultGlobals } from './defaultTheme';

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
  it('hides parameterized detail pages and cart/checkout from nav, keeps Home visible', () => {
    const pages = createDefaultPages();
    const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
    expect(byId.home.hiddenFromNav).toBe(false);
    expect(byId.product.hiddenFromNav).toBe(true);
    expect(byId.collection.hiddenFromNav).toBe(true);
    expect(byId.cart.hiddenFromNav).toBe(true);
    expect(byId.checkout.hiddenFromNav).toBe(true);
  });
});

describe('createDefaultGlobals', () => {
  it('pre-fills header nav_links from nav-eligible pages only', () => {
    const { header } = createDefaultGlobals(createDefaultPages());
    expect(header.data.nav_links).toEqual([{ id: 'nav-home', label: 'Home', url: '/' }]);
  });

  it('includes custom pages and other non-hidden static-slug pages', () => {
    const pages = [
      ...createDefaultPages(),
      { id: 'about', name: 'About', type: 'custom', slug: '/about', sections: [], seo: {}, hiddenFromNav: false },
    ];
    const { header } = createDefaultGlobals(pages);
    expect(header.data.nav_links.map((l) => l.url)).toEqual(['/', '/about']);
  });

  it('leaves nav_links unset when no pages are supplied (backward compatible)', () => {
    const { header } = createDefaultGlobals();
    expect(header.data.nav_links).toBeNull();
  });
});
