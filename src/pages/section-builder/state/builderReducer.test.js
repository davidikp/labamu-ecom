import { describe, it, expect } from 'vitest';
import { builderReducer, createInitialState, ACTIONS, MAX_SECTIONS_PER_PAGE } from './builderReducer';

function makeState() {
  return createInitialState({
    storeId: 'store-1',
    pages: [{ id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {} }],
    theme: { colors: { primary: '#000' } },
    header: { id: 'header', type: 'header', hidden: false, data: {} },
    footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
  });
}

describe('builderReducer', () => {
  it('adds a section at the given index and selects it', () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: ACTIONS.ADD_SECTION,
      pageId: 'home',
      section: { id: 's1', type: 'hero_banner', data: {} },
      index: 0,
    });
    expect(next.pages[0].sections).toHaveLength(1);
    expect(next.pages[0].sections[0].id).toBe('s1');
    expect(next.selection.id).toBe('s1');
  });

  it('does not add beyond the 20-section cap', () => {
    let state = makeState();
    for (let i = 0; i < MAX_SECTIONS_PER_PAGE; i += 1) {
      state = builderReducer(state, {
        type: ACTIONS.ADD_SECTION,
        pageId: 'home',
        section: { id: `s${i}`, data: {} },
      });
    }
    const next = builderReducer(state, {
      type: ACTIONS.ADD_SECTION,
      pageId: 'home',
      section: { id: 'overflow', data: {} },
    });
    expect(next.pages[0].sections).toHaveLength(MAX_SECTIONS_PER_PAGE);
  });

  it('duplicates a section directly below the original and selects the copy', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a', data: { heading: 'Hi' } } });
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'b', data: {} } });
    const next = builderReducer(state, { type: ACTIONS.DUPLICATE_SECTION, pageId: 'home', sectionId: 'a', newId: 'a-copy' });
    const ids = next.pages[0].sections.map((s) => s.id);
    expect(ids).toEqual(['a', 'a-copy', 'b']);
    expect(next.selection.id).toBe('a-copy');
  });

  it('reorders sections by id list', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a' } });
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'b' } });
    const next = builderReducer(state, {
      type: ACTIONS.REORDER_SECTIONS,
      pageId: 'home',
      orderedIds: ['b', 'a'],
    });
    expect(next.pages[0].sections.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('moves a section up/down and is a no-op at the boundaries', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a' } });
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'b' } });

    let next = builderReducer(state, { type: ACTIONS.MOVE_SECTION, pageId: 'home', sectionId: 'a', direction: 1 });
    expect(next.pages[0].sections.map((s) => s.id)).toEqual(['b', 'a']);

    const noop = builderReducer(next, { type: ACTIONS.MOVE_SECTION, pageId: 'home', sectionId: 'b', direction: -1 });
    expect(noop.pages[0].sections.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('removes a section and clears selection if it was selected', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a' } });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_SECTION, pageId: 'home', sectionId: 'a' });
    expect(next.pages[0].sections).toHaveLength(0);
    expect(next.selection.id).toBeNull();
  });

  it('refuses to remove the Shop page\'s designated core catalog_list section', () => {
    const state = createInitialState({
      storeId: 'store-1',
      pages: [
        { id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {} },
        {
          id: 'shop', name: 'Shop', type: 'system', systemType: 'shop', slug: '/shop', seo: {},
          sections: [{ id: 'shop-catalog', type: 'catalog_list', data: {} }],
        },
      ],
      theme: {},
      header: { id: 'header', type: 'header', hidden: false, data: {} },
      footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_SECTION, pageId: 'shop', sectionId: 'shop-catalog' });
    expect(next.pages.find((p) => p.id === 'shop').sections).toHaveLength(1);
  });

  it('refuses to remove the Product page\'s designated core product_detail section', () => {
    const state = createInitialState({
      storeId: 'store-1',
      pages: [
        { id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {} },
        {
          id: 'product', name: 'Product', type: 'system', systemType: 'product', slug: '/products/:handle', seo: {},
          sections: [{ id: 'product-default-detail', type: 'product_detail', data: {} }],
        },
      ],
      theme: {},
      header: { id: 'header', type: 'header', hidden: false, data: {} },
      footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_SECTION, pageId: 'product', sectionId: 'product-default-detail' });
    expect(next.pages.find((p) => p.id === 'product').sections).toHaveLength(1);
  });

  it("refuses to remove the Editorial Collection Detail page's designated core section", () => {
    const state = createInitialState({
      storeId: 'store-1',
      pages: [
        { id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {} },
        {
          id: 'editorial-collection-detail', name: 'Collection Detail', type: 'system', systemType: 'editorial_collection_detail', slug: '/collection/:slug', seo: {},
          sections: [{ id: 'editorial-collection-detail-story', type: 'editorial_collection_detail', data: {} }],
        },
      ],
      theme: {},
      header: { id: 'header', type: 'header', hidden: false, data: {} },
      footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_SECTION, pageId: 'editorial-collection-detail', sectionId: 'editorial-collection-detail-story' });
    expect(next.pages.find((p) => p.id === 'editorial-collection-detail').sections).toHaveLength(1);
  });

  it('still allows removing a non-core section from the Shop page', () => {
    const state = createInitialState({
      storeId: 'store-1',
      pages: [
        {
          id: 'shop', name: 'Shop', type: 'system', systemType: 'shop', slug: '/shop', seo: {},
          sections: [{ id: 'shop-catalog', type: 'catalog_list', data: {} }, { id: 'extra', type: 'hero_banner', data: {} }],
        },
      ],
      theme: {},
      header: { id: 'header', type: 'header', hidden: false, data: {} },
      footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_SECTION, pageId: 'shop', sectionId: 'extra' });
    expect(next.pages.find((p) => p.id === 'shop').sections.map((s) => s.id)).toEqual(['shop-catalog']);
  });

  it('merges partial data on UPDATE_SECTION_DATA without touching other fields', () => {
    let state = makeState();
    state = builderReducer(state, {
      type: ACTIONS.ADD_SECTION,
      pageId: 'home',
      section: { id: 'a', data: { heading: 'Hi', subtext: 'Sub' } },
    });
    const next = builderReducer(state, {
      type: ACTIONS.UPDATE_SECTION_DATA,
      pageId: 'home',
      sectionId: 'a',
      data: { heading: 'Hello' },
    });
    expect(next.pages[0].sections[0].data).toEqual({ heading: 'Hello', subtext: 'Sub' });
  });

  it('toggles header/footer hidden without affecting the other', () => {
    let state = makeState();
    const next = builderReducer(state, { type: ACTIONS.TOGGLE_GLOBAL_HIDDEN, which: 'header' });
    expect(next.header.hidden).toBe(true);
    expect(next.footer.hidden).toBe(false);
  });

  it('applies a theme preset to colors and typography only, leaving buttons/layout untouched', () => {
    let state = makeState();
    state = { ...state, theme: { ...state.theme, buttons: { corner_radius: 4 }, layout: { section_spacing: 'medium' } } };
    const next = builderReducer(state, {
      type: ACTIONS.APPLY_THEME_PRESET,
      colors: { primary: '#111111' },
      typography: { heading_font: 'Lora' },
    });
    expect(next.theme.colors).toEqual({ primary: '#111111' });
    expect(next.theme.typography).toEqual({ heading_font: 'Lora' });
    expect(next.theme.buttons).toEqual({ corner_radius: 4 });
    expect(next.theme.layout).toEqual({ section_spacing: 'medium' });
  });

  it('reorders pages by id list, dropping unknown ids', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_PAGE, page: { id: 'about', name: 'About', type: 'custom', slug: '/about', sections: [], seo: {} } });
    state = builderReducer(state, { type: ACTIONS.ADD_PAGE, page: { id: 'contact', name: 'Contact', type: 'custom', slug: '/contact', sections: [], seo: {} } });
    const next = builderReducer(state, { type: ACTIONS.REORDER_PAGES, orderedIds: ['contact', 'home', 'nonexistent', 'about'] });
    expect(next.pages.map((p) => p.id)).toEqual(['contact', 'home', 'about']);
  });

  it('seeds theme, pages, and globals from a site template and sets activeTemplateId', () => {
    let state = makeState();
    state = { ...state, activeTemplateId: null };
    const next = builderReducer(state, {
      type: ACTIONS.APPLY_SITE_TEMPLATE_SEED,
      templateId: 'fnb',
      theme: { colors: { primary: '#6b4f3b' }, typography: { heading_font: 'Lora' } },
      pages: [{ id: 'home', name: 'Home', type: 'system', slug: '/', sections: [{ id: 's1', type: 'hero_banner', data: {} }], seo: {} }],
      header: { id: 'header', type: 'header', hidden: false, data: { foo: 'bar' } },
      footer: { id: 'footer', type: 'footer', hidden: false, data: { foo: 'bar' } },
    });
    expect(next.activeTemplateId).toBe('fnb');
    expect(next.theme.colors).toEqual({ primary: '#6b4f3b' });
    // Template supplied only 'home' — Shop + Product Detail are merged in
    // automatically (mergeRequiredSystemPages, see defaultTheme.js) since no
    // page in the template's own list already fills those roles.
    expect(next.pages).toHaveLength(3);
    expect(next.pages[0].sections).toHaveLength(1);
    expect(next.pages.map((p) => p.id)).toEqual(['home', 'shop', 'product']);
    expect(next.activePageId).toBe('home');
    expect(next.header.data).toEqual({ foo: 'bar' });
  });

  it('does not duplicate Shop/Product when a template already defines pages filling those roles', () => {
    let state = makeState();
    state = { ...state, activeTemplateId: null };
    const next = builderReducer(state, {
      type: ACTIONS.APPLY_SITE_TEMPLATE_SEED,
      templateId: 'custom-template',
      theme: {},
      pages: [
        { id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {} },
        { id: 'shop', name: 'Shop', type: 'system', systemType: 'shop', slug: '/shop', sections: [], seo: {} },
        { id: 'my-pdp', name: 'PDP', type: 'system', systemType: 'product', slug: '/products/:handle', sections: [], seo: {} },
      ],
      header: { id: 'header', type: 'header', hidden: false, data: {} },
      footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
    });
    expect(next.pages).toHaveLength(3);
    expect(next.pages.map((p) => p.id)).toEqual(['home', 'shop', 'my-pdp']);
  });

  it('seeds mediaLibrary from the template media, defaulting to empty when omitted', () => {
    let state = makeState();
    state = { ...state, activeTemplateId: null, mediaLibrary: [{ id: 'stale', filename: 'old.jpg' }] };
    const seedBase = {
      type: ACTIONS.APPLY_SITE_TEMPLATE_SEED,
      templateId: 'fnb',
      theme: {},
      pages: [{ id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {} }],
      header: { id: 'header', type: 'header', hidden: false, data: {} },
      footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
    };
    const withMedia = builderReducer(state, { ...seedBase, media: [{ id: 'm1', filename: 'hero.jpg', url: '/x.jpg' }] });
    expect(withMedia.mediaLibrary).toEqual([{ id: 'm1', filename: 'hero.jpg', url: '/x.jpg' }]);

    const withoutMedia = builderReducer(state, seedBase);
    expect(withoutMedia.mediaLibrary).toEqual([]);
  });

  it('reskins theme colors/typography on template switch without touching pages, globals, or media', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a', data: { heading: 'Custom' } } });
    state = { ...state, activeTemplateId: 'fnb', mediaLibrary: [{ id: 'm1', filename: 'hero.jpg' }] };
    const next = builderReducer(state, {
      type: ACTIONS.APPLY_SITE_TEMPLATE_RESKIN,
      templateId: 'clothing',
      colors: { primary: '#1a1a1a' },
      typography: { heading_font: 'Cormorant Garamond' },
    });
    expect(next.activeTemplateId).toBe('clothing');
    expect(next.theme.colors).toEqual({ primary: '#1a1a1a' });
    expect(next.theme.typography).toEqual({ heading_font: 'Cormorant Garamond' });
    // page structure/customization/media untouched
    expect(next.pages[0].sections).toEqual(state.pages[0].sections);
    expect(next.header).toBe(state.header);
    expect(next.footer).toBe(state.footer);
    expect(next.mediaLibrary).toBe(state.mediaLibrary);
  });

  it('updates a single theme field within its group without affecting others', () => {
    let state = makeState();
    state = { ...state, theme: { colors: { primary: '#000', accent: '#fff' } } };
    const next = builderReducer(state, {
      type: ACTIONS.UPDATE_THEME_FIELD,
      group: 'colors',
      field: 'primary',
      value: '#123456',
    });
    expect(next.theme.colors).toEqual({ primary: '#123456', accent: '#fff' });
  });

  it('adds a page, makes it active, and clears selection', () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: ACTIONS.ADD_PAGE,
      page: { id: 'about', name: 'About', type: 'custom', slug: 'about', sections: [], seo: {} },
    });
    expect(next.pages.map((p) => p.id)).toEqual(['home', 'about']);
    expect(next.activePageId).toBe('about');
  });

  it('renames a page without touching its slug', () => {
    let state = makeState();
    state = builderReducer(state, {
      type: ACTIONS.ADD_PAGE,
      page: { id: 'about', name: 'About', type: 'custom', slug: 'about', sections: [], seo: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.RENAME_PAGE, pageId: 'about', name: 'About Us' });
    const page = next.pages.find((p) => p.id === 'about');
    expect(page.name).toBe('About Us');
    expect(page.slug).toBe('about');
  });

  it('deletes a page and falls back to the first remaining page if it was active', () => {
    let state = makeState();
    state = builderReducer(state, {
      type: ACTIONS.ADD_PAGE,
      page: { id: 'about', name: 'About', type: 'custom', slug: 'about', sections: [], seo: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.DELETE_PAGE, pageId: 'about' });
    expect(next.pages.map((p) => p.id)).toEqual(['home']);
    expect(next.activePageId).toBe('home');
  });

  it('refuses to delete a required system page (Shop/Product Detail) via DELETE_PAGE', () => {
    let state = makeState();
    state = {
      ...state,
      pages: [
        ...state.pages,
        { id: 'shop', name: 'Shop', type: 'system', systemType: 'shop', slug: '/shop', sections: [], seo: {} },
        { id: 'product', name: 'Product', type: 'system', systemType: 'product', slug: '/products/:handle', sections: [], seo: {} },
      ],
    };
    let next = builderReducer(state, { type: ACTIONS.DELETE_PAGE, pageId: 'shop' });
    expect(next.pages.map((p) => p.id)).toEqual(['home', 'shop', 'product']);
    next = builderReducer(state, { type: ACTIONS.DELETE_PAGE, pageId: 'product' });
    expect(next.pages.map((p) => p.id)).toEqual(['home', 'shop', 'product']);
  });

  it('allows deleting Editorial Collection List/Detail — optional system pages, not required like Shop/Product', () => {
    let state = makeState();
    state = {
      ...state,
      pages: [
        ...state.pages,
        { id: 'editorial-collection-list', name: 'Collection', type: 'system', systemType: 'editorial_collection_list', slug: '/collection', sections: [], seo: {} },
        { id: 'editorial-collection-detail', name: 'Collection Detail', type: 'system', systemType: 'editorial_collection_detail', slug: '/collection/:slug', sections: [], seo: {} },
      ],
    };
    let next = builderReducer(state, { type: ACTIONS.DELETE_PAGE, pageId: 'editorial-collection-list' });
    expect(next.pages.map((p) => p.id)).not.toContain('editorial-collection-list');
    next = builderReducer(next, { type: ACTIONS.DELETE_PAGE, pageId: 'editorial-collection-detail' });
    expect(next.pages.map((p) => p.id)).not.toContain('editorial-collection-detail');
  });

  it('excludes required system pages from a BULK_DELETE_PAGES set, deleting the rest', () => {
    let state = makeState();
    state = {
      ...state,
      pages: [
        ...state.pages,
        { id: 'shop', name: 'Shop', type: 'system', systemType: 'shop', slug: '/shop', sections: [], seo: {} },
        { id: 'about', name: 'About', type: 'custom', slug: '/about', sections: [], seo: {} },
      ],
    };
    const next = builderReducer(state, { type: ACTIONS.BULK_DELETE_PAGES, pageIds: ['shop', 'about'] });
    expect(next.pages.map((p) => p.id)).toEqual(['home', 'shop']);
  });

  it('merges partial SEO data for a page', () => {
    let state = makeState();
    state = { ...state, pages: [{ ...state.pages[0], seo: { metaTitle: 'Home' } }] };
    const next = builderReducer(state, {
      type: ACTIONS.UPDATE_PAGE_SEO,
      pageId: 'home',
      seo: { metaDescription: 'Welcome' },
    });
    expect(next.pages[0].seo).toEqual({ metaTitle: 'Home', metaDescription: 'Welcome' });
  });

  it('toggles a page hidden-from-nav flag', () => {
    const state = makeState();
    const next = builderReducer(state, { type: ACTIONS.TOGGLE_PAGE_NAV_HIDDEN, pageId: 'home' });
    expect(next.pages[0].hiddenFromNav).toBe(true);
  });

  it('adds a media item to the front of the library', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_MEDIA_ITEM, item: { id: 'm1', filename: 'a.png' } });
    const next = builderReducer(state, { type: ACTIONS.ADD_MEDIA_ITEM, item: { id: 'm2', filename: 'b.png' } });
    expect(next.mediaLibrary.map((m) => m.id)).toEqual(['m2', 'm1']);
  });

  it('removes a media item by id', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_MEDIA_ITEM, item: { id: 'm1', filename: 'a.png' } });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_MEDIA_ITEM, id: 'm1' });
    expect(next.mediaLibrary).toHaveLength(0);
  });

  it('select and deselect update the selection', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.SELECT, id: 'a' });
    expect(state.selection.id).toBe('a');
    state = builderReducer(state, { type: ACTIONS.DESELECT });
    expect(state.selection.id).toBeNull();
  });
});

describe('builderReducer — blocks', () => {
  function stateWithSection() {
    let state = makeState();
    state = builderReducer(state, {
      type: ACTIONS.ADD_SECTION,
      pageId: 'home',
      section: { id: 'sec1', type: 'testimonials', data: {}, blocks: [] },
      index: 0,
    });
    return state;
  }
  const block = (id) => ({ id, type: 'quote', data: { quote: id } });

  it('adds a block at an index and selects it (compound id)', () => {
    let state = stateWithSection();
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', block: block('b1') });
    expect(state.pages[0].sections[0].blocks).toHaveLength(1);
    expect(state.selection.id).toBe('sec1::b1');
  });

  it('removes a block and clears block selection back to the section', () => {
    let state = stateWithSection();
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', block: block('b1') });
    state = builderReducer(state, { type: ACTIONS.REMOVE_BLOCK, pageId: 'home', sectionId: 'sec1', blockId: 'b1' });
    expect(state.pages[0].sections[0].blocks).toHaveLength(0);
    expect(state.selection.id).toBe('sec1');
  });

  it('reorders and updates block data', () => {
    let state = stateWithSection();
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', block: block('b1') });
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', block: block('b2') });
    state = builderReducer(state, { type: ACTIONS.REORDER_BLOCKS, pageId: 'home', sectionId: 'sec1', orderedIds: ['b2', 'b1'] });
    expect(state.pages[0].sections[0].blocks.map((b) => b.id)).toEqual(['b2', 'b1']);
    state = builderReducer(state, { type: ACTIONS.UPDATE_BLOCK_DATA, pageId: 'home', sectionId: 'sec1', blockId: 'b1', data: { quote: 'edited' } });
    expect(state.pages[0].sections[0].blocks.find((b) => b.id === 'b1').data.quote).toBe('edited');
  });

  it('adds/removes/reorders blocks inside a group (parentPath)', () => {
    let state = stateWithSection();
    // top-level group block
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', block: { id: 'g1', type: 'group', data: {}, blocks: [] } });
    // add two children into the group
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', parentPath: ['g1'], block: { id: 'c1', type: 'heading', data: {} } });
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', parentPath: ['g1'], block: { id: 'c2', type: 'text', data: {} } });
    const group = () => state.pages[0].sections[0].blocks.find((b) => b.id === 'g1');
    expect(group().blocks.map((b) => b.id)).toEqual(['c1', 'c2']);
    expect(state.selection.id).toBe('sec1::g1::c2');
    // reorder children
    state = builderReducer(state, { type: ACTIONS.REORDER_BLOCKS, pageId: 'home', sectionId: 'sec1', parentPath: ['g1'], orderedIds: ['c2', 'c1'] });
    expect(group().blocks.map((b) => b.id)).toEqual(['c2', 'c1']);
    // update a child's data
    state = builderReducer(state, { type: ACTIONS.UPDATE_BLOCK_DATA, pageId: 'home', sectionId: 'sec1', parentPath: ['g1'], blockId: 'c1', data: { text: 'Hi' } });
    expect(group().blocks.find((b) => b.id === 'c1').data.text).toBe('Hi');
    // remove a child -> selection falls back to the group
    state = builderReducer(state, { type: ACTIONS.SELECT, id: 'sec1::g1::c1' });
    state = builderReducer(state, { type: ACTIONS.REMOVE_BLOCK, pageId: 'home', sectionId: 'sec1', parentPath: ['g1'], blockId: 'c1' });
    expect(group().blocks.map((b) => b.id)).toEqual(['c2']);
    expect(state.selection.id).toBe('sec1::g1');
  });

  it('supports a group nested inside a group (multi-level nesting)', () => {
    let state = stateWithSection();
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', block: { id: 'g1', type: 'group', data: {}, blocks: [] } });
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', parentPath: ['g1'], block: { id: 'g2', type: 'group', data: {}, blocks: [] } });
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', parentPath: ['g1', 'g2'], block: { id: 'c1', type: 'heading', data: {} } });

    const inner = () => state.pages[0].sections[0].blocks.find((b) => b.id === 'g1').blocks.find((b) => b.id === 'g2');
    expect(inner().blocks.map((b) => b.id)).toEqual(['c1']);
    expect(state.selection.id).toBe('sec1::g1::g2::c1');

    state = builderReducer(state, { type: ACTIONS.UPDATE_BLOCK_DATA, pageId: 'home', sectionId: 'sec1', parentPath: ['g1', 'g2'], blockId: 'c1', data: { text: 'Deep' } });
    expect(inner().blocks.find((b) => b.id === 'c1').data.text).toBe('Deep');

    // move c1 out of g2 to the section's top level
    state = builderReducer(state, {
      type: ACTIONS.MOVE_BLOCK_TO_PATH,
      pageId: 'home',
      sectionId: 'sec1',
      blockId: 'c1',
      fromParentPath: ['g1', 'g2'],
      toParentPath: [],
      toIndex: 0,
    });
    expect(inner().blocks).toHaveLength(0);
    expect(state.pages[0].sections[0].blocks.map((b) => b.id)).toEqual(['c1', 'g1']);
  });

  it('duplicates a section with fresh block ids', () => {
    let state = stateWithSection();
    state = builderReducer(state, { type: ACTIONS.ADD_BLOCK, pageId: 'home', sectionId: 'sec1', block: block('b1') });
    state = builderReducer(state, { type: ACTIONS.DUPLICATE_SECTION, pageId: 'home', sectionId: 'sec1', newId: 'sec2' });
    const [orig, copy] = state.pages[0].sections;
    expect(copy.blocks).toHaveLength(1);
    expect(copy.blocks[0].id).not.toBe(orig.blocks[0].id);
    expect(copy.blocks[0].data.quote).toBe('b1');
  });
});
