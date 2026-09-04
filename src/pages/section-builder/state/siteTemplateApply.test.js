import { describe, it, expect, vi } from 'vitest';
import { applySiteTemplate } from './siteTemplateApply';
import { SITE_TEMPLATES } from './siteTemplates';
import { createFreshState } from './useSectionBuilder';

// storage.js persists via localStorage, which isn't reliably available in
// every Node/jsdom combination this suite runs under — mock it with a
// simple in-memory map so this test only exercises applySiteTemplate's own
// logic (seed-vs-reskin, persistence call), not the storage backend itself
// (already covered by storage.js's own tests, if any, plus real browser use).
const memory = new Map();
const published = new Map();
vi.mock('./storage', () => ({
  loadDraft: (storeId) => memory.get(storeId) ?? null,
  saveDraft: (storeId, state) => { memory.set(storeId, state); return true; },
  loadPublished: (storeId) => published.get(storeId) ?? null,
  savePublished: (storeId, state) => { published.set(storeId, state); return true; },
}));

const fnb = SITE_TEMPLATES.find((t) => t.id === 'fnb');
const clothing = SITE_TEMPLATES.find((t) => t.id === 'clothing');

describe('applySiteTemplate', () => {
  it('seeds theme, pages, and globals on first pick and persists activeTemplateId', () => {
    const storeId = 'store-seed';
    const next = applySiteTemplate(storeId, fnb);
    expect(next.activeTemplateId).toBe('fnb');
    expect(next.theme.colors).toEqual(fnb.theme.colors);
    expect(next.pages.map((p) => p.id)).toEqual(fnb.pages.map((p) => p.id));
    expect(memory.get(storeId)).toBe(next);
  });

  it('seeds the template media library and merges header/footer content overrides onto the generic defaults', () => {
    const storeId = 'store-seed-media';
    const next = applySiteTemplate(storeId, fnb);
    expect(next.mediaLibrary).toEqual(fnb.media);
    expect(next.header.data.layout_variant).toBe(fnb.header.layout_variant);
    expect(next.header.data.logo_text).toBe(fnb.header.logo_text);
    expect(next.footer.data.tagline).toBe(fnb.footer.tagline);
    // Fields the template doesn't override (e.g. nav_links, auto-derived
    // from the page roster by createDefaultGlobals) still come through.
    expect(next.header.data.nav_links).toBeTruthy();
    expect(next.header.data.nav_links.length).toBeGreaterThan(0);
  });

  it('reskins colors/typography only when switching an already-seeded site, leaving pages/customizations untouched', () => {
    const storeId = 'store-reskin';
    applySiteTemplate(storeId, fnb);
    // Simulate a merchant customization on the home page before switching.
    const seeded = memory.get(storeId);
    seeded.pages[0].sections[0].data.overlay_opacity = 42;

    const next = applySiteTemplate(storeId, clothing);
    expect(next.activeTemplateId).toBe('clothing');
    expect(next.theme.colors).toEqual(clothing.theme.colors);
    expect(next.theme.typography).toEqual(clothing.theme.typography);
    // Page structure and the custom edit survive the switch untouched.
    expect(next.pages.map((p) => p.id)).toEqual(fnb.pages.map((p) => p.id));
    expect(next.pages[0].sections[0].data.overlay_opacity).toBe(42);
  });

  it('publishes the applied template immediately, so a later discard-in-builder cannot revert the theme switch', () => {
    const storeId = 'store-publish-sync';
    const next = applySiteTemplate(storeId, fnb);
    expect(published.get(storeId)).toBe(next);
  });

  it('seeds from a fresh state when the store has no prior draft', () => {
    const next = applySiteTemplate('brand-new-store', clothing);
    expect(next.activeTemplateId).toBe('clothing');
    expect(next.pages.map((p) => p.id)).toEqual(clothing.pages.map((p) => p.id));
    // Sanity check against what a fresh, template-less state would look like.
    const fresh = createFreshState('brand-new-store');
    expect(fresh.activeTemplateId).toBeNull();
  });
});
