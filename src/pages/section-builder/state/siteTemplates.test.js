import { describe, it, expect } from 'vitest';
import { SITE_TEMPLATES, siteTemplateById } from './siteTemplates';
import { resolveMedia } from '../ui/fields/imageValue';

/** Recursively collects every `{ mediaId }`-shaped value found in a
 * section's data/blocks, however deeply nested (image fields today, but
 * this stays correct if a future field nests one further). */
function collectMediaRefs(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (typeof value.mediaId === 'string') out.push(value.mediaId);
  for (const v of Object.values(value)) collectMediaRefs(v, out);
  return out;
}

describe('SITE_TEMPLATES', () => {
  it('builds valid section data for every template/page/section', () => {
    expect(SITE_TEMPLATES.length).toBeGreaterThan(0);
    for (const tpl of SITE_TEMPLATES) {
      expect(tpl.theme.colors).toBeTruthy();
      expect(tpl.theme.typography).toBeTruthy();
      for (const page of tpl.pages) {
        for (const section of page.sections) {
          expect(section.id).toBeTruthy();
          expect(section.data).toBeTruthy();
        }
      }
    }
  });

  it('siteTemplateById finds/returns null correctly', () => {
    expect(siteTemplateById('fnb').id).toBe('fnb');
    expect(siteTemplateById('nope')).toBeNull();
  });

  it('every header/footer/section mediaId reference resolves against that template\'s own media library', () => {
    for (const tpl of SITE_TEMPLATES) {
      const refs = [
        ...collectMediaRefs(tpl.header),
        ...collectMediaRefs(tpl.footer),
        ...tpl.pages.flatMap((page) => page.sections.flatMap((s) => collectMediaRefs(s.data))),
      ];
      expect(refs.length).toBeGreaterThan(0); // sanity: this test isn't vacuous
      for (const mediaId of refs) {
        const resolved = resolveMedia({ mediaId }, tpl.media);
        expect(resolved, `template "${tpl.id}" references unknown mediaId "${mediaId}"`).not.toBeNull();
      }
    }
  });

  it('every media entry has a URL under the expected /assets/templates/<id>/ path', () => {
    for (const tpl of SITE_TEMPLATES) {
      for (const item of tpl.media) {
        expect(item.url).toBe(`/assets/templates/${tpl.id}/${item.filename}`);
        expect(item.id).toBeTruthy();
      }
    }
  });
});

describe('SITE_TEMPLATES — Houzez Collection integration', () => {
  const houzez = siteTemplateById('houzez');

  it("includes Editorial Collection List/Detail in Houzez's own page roster (not merged in automatically — Collection isn't a REQUIRED_SYSTEM_TYPES page)", () => {
    const systemTypes = houzez.pages.map((p) => p.systemType);
    expect(systemTypes).toContain('editorial_collection_list');
    expect(systemTypes).toContain('editorial_collection_detail');
  });

  it('gives Houzez Collection List a visible, non-parameterized slug and Collection Detail a hidden, parameterized one', () => {
    const list = houzez.pages.find((p) => p.systemType === 'editorial_collection_list');
    const detail = houzez.pages.find((p) => p.systemType === 'editorial_collection_detail');
    expect(list.slug).toBe('/collection');
    expect(list.hiddenFromNav).toBe(false);
    expect(detail.slug).toBe('/collection/:slug');
    expect(detail.hiddenFromNav).toBe(true);
  });

  it("exposes Collection in Houzez's Main menu pointing at /collection", () => {
    const collectionLink = houzez.menus['main-menu'].items.find((l) => l.url === '/collection');
    expect(collectionLink).toBeTruthy();
    expect(collectionLink.label).toBe('Collection');
  });

  it('places Collection within the first nav_overflow_after entries so it renders visibly, not inside the "⋯" overflow menu', () => {
    const items = houzez.menus['main-menu'].items;
    const index = items.findIndex((l) => l.url === '/collection');
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(items.length);
    expect(index < houzez.header.nav_overflow_after).toBe(true);
  });
});
