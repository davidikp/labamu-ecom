import { describe, it, expect } from 'vitest';
import { matchStorefrontPage } from './pageRouting';
import { createDefaultPages, mergeRequiredSystemPages, requiredSystemPages } from './defaultTheme';
import { siteTemplateById } from './siteTemplates';

describe('matchStorefrontPage', () => {
  const pages = createDefaultPages();

  it('matches an exact static slug (Home)', () => {
    const result = matchStorefrontPage(pages, '/');
    expect(result?.page.id).toBe('home');
    expect(result?.params).toEqual({});
  });

  it('matches Shop exactly', () => {
    const result = matchStorefrontPage(pages, '/shop');
    expect(result?.page.id).toBe('shop');
  });

  it('matches the parameterized Product Detail route and extracts the handle', () => {
    const result = matchStorefrontPage(pages, '/products/krisbow-ladder');
    expect(result?.page.id).toBe('product');
    expect(result?.params).toEqual({ handle: 'krisbow-ladder' });
  });

  it('resolves the product route even for a handle with no matching product (route existence, not product existence)', () => {
    const result = matchStorefrontPage(pages, '/products/not-real');
    expect(result?.page.id).toBe('product');
    expect(result?.params.handle).toBe('not-real');
  });

  it('matches the parameterized Collection route and extracts the handle', () => {
    const result = matchStorefrontPage(pages, '/collections/best-sellers');
    expect(result?.page.id).toBe('collection');
    expect(result?.params).toEqual({ handle: 'best-sellers' });
  });

  it('matches the Editorial Collection List route exactly', () => {
    const result = matchStorefrontPage(pages, '/collection');
    expect(result?.page.id).toBe('editorial-collection-list');
    expect(result?.params).toEqual({});
  });

  it('matches the parameterized Editorial Collection Detail route and extracts the slug', () => {
    const result = matchStorefrontPage(pages, '/collection/forma');
    expect(result?.page.id).toBe('editorial-collection-detail');
    expect(result?.params).toEqual({ slug: 'forma' });
  });

  it('resolves the Editorial Collection Detail route even for a slug with no matching collection (route existence, not collection existence)', () => {
    const result = matchStorefrontPage(pages, '/collection/does-not-exist');
    expect(result?.page.id).toBe('editorial-collection-detail');
    expect(result?.params.slug).toBe('does-not-exist');
  });

  it('returns null for an unknown route', () => {
    expect(matchStorefrontPage(pages, '/nope')).toBeNull();
  });

  it('returns null for a nested path under a parameterized slug beyond its own depth', () => {
    expect(matchStorefrontPage(pages, '/products/a/b')).toBeNull();
  });

  it('returns null/handles gracefully for empty inputs', () => {
    expect(matchStorefrontPage([], '/')).toBeNull();
    expect(matchStorefrontPage(pages, '')).toBeNull();
    expect(matchStorefrontPage(undefined, '/')).toBeNull();
  });
});

describe('matchStorefrontPage — Houzez site template (regression: Collection was unreachable)', () => {
  // Mirrors exactly what ThemePreview.jsx / PreviewLive.jsx / builderReducer's
  // APPLY_SITE_TEMPLATE_SEED do with a site template's own page roster: merge
  // in only the REQUIRED_SYSTEM_TYPES pages Houzez doesn't already define.
  const houzezPages = mergeRequiredSystemPages(siteTemplateById('houzez').pages, requiredSystemPages());

  it('resolves /collection to Collection List without visiting it first', () => {
    const result = matchStorefrontPage(houzezPages, '/collection');
    expect(result?.page.systemType).toBe('editorial_collection_list');
  });

  it('resolves /collection/:slug to Collection Detail directly, extracting the slug', () => {
    const result = matchStorefrontPage(houzezPages, '/collection/forma');
    expect(result?.page.systemType).toBe('editorial_collection_detail');
    expect(result?.params).toEqual({ slug: 'forma' });
  });

  it('still resolves Shop and Product (merged in as REQUIRED_SYSTEM_TYPES) alongside Collection', () => {
    expect(matchStorefrontPage(houzezPages, '/shop')?.page.systemType).toBe('shop');
    expect(matchStorefrontPage(houzezPages, '/products/anything')?.page.systemType).toBe('product');
  });
});
