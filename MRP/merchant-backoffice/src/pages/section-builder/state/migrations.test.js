import { describe, it, expect } from 'vitest';
import { migrateState } from './migrations';

describe('migrateState — repeater → blocks', () => {
  it('folds a legacy repeater array into typed blocks and drops the old key', () => {
    const legacy = {
      pages: [
        {
          id: 'home',
          sections: [
            {
              id: 'sec1',
              type: 'testimonials',
              data: {
                heading: 'Hi',
                quotes: [
                  { id: 'q1', quote: 'Great', reviewer_name: 'Ada', star_rating: '5' },
                  { id: 'q2', quote: 'Nice', reviewer_name: 'Lin', star_rating: '4' },
                ],
              },
            },
          ],
        },
      ],
    };
    const out = migrateState(legacy);
    const sec = out.pages[0].sections[0];
    expect(sec.data.quotes).toBeUndefined();
    expect(sec.blocks).toHaveLength(2);
    expect(sec.blocks[0]).toEqual({ id: 'q1', type: 'quote', data: { quote: 'Great', reviewer_name: 'Ada', star_rating: '5' } });
    expect(sec.data.heading).toBe('Hi');
  });

  it('is idempotent — a second run leaves already-migrated blocks untouched', () => {
    const legacy = {
      pages: [{ id: 'home', sections: [{ id: 's', type: 'testimonials', data: { quotes: [{ id: 'q1', quote: 'x' }] } }] }],
    };
    const once = migrateState(legacy);
    const twice = migrateState(once);
    expect(twice.pages[0].sections[0].blocks).toHaveLength(1);
    expect(twice).toEqual(once);
  });

  it('handles null / missing pages', () => {
    expect(migrateState(null)).toBeNull();
    expect(migrateState({})).toEqual({});
  });
});

describe('migrateState — content fields → blocks', () => {
  it('folds a Hero heading/subtext/button into content blocks and strips the keys', () => {
    const legacy = {
      pages: [{ id: 'home', sections: [{ id: 's', type: 'hero_banner', data: { heading: 'Hi', subtext: 'Sub', button_label: 'Go', button_url: '/x', background_color: { slot: 'surface' } } }] }],
    };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.heading).toBeUndefined();
    expect(sec.data.button_label).toBeUndefined();
    expect(sec.data.background_color).toEqual({ slot: 'surface' }); // section field kept
    const types = sec.blocks.map((b) => b.type);
    expect(types).toEqual(['heading', 'subheading', 'button']);
    expect(sec.blocks[0].data.text).toBe('Hi');
    expect(sec.blocks[2].data.url).toBe('/x');
  });

  it('is idempotent for content sections', () => {
    const legacy = { pages: [{ id: 'home', sections: [{ id: 's', type: 'rich_text', data: { content: '<p>x</p>' } }] }] };
    const once = migrateState(legacy);
    const twice = migrateState(once);
    expect(twice).toEqual(once);
    expect(once.pages[0].sections[0].blocks).toHaveLength(1);
  });
});

describe('migrateState — collection_list backfill', () => {
  it('backfills collections (by display_style) when the key is absent', () => {
    const legacy = {
      pages: [{ id: 'home', sections: [{ id: 's', type: 'collection_list', data: { display_style: 'circular' } }] }],
    };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.collections.map((c) => c.handle)).toEqual(['tops', 'bottoms', 'dresses', 'shoes', 'bags', 'perfumes']);
  });

  it('defaults to the cards handles when display_style is also unset', () => {
    const legacy = { pages: [{ id: 'home', sections: [{ id: 's', type: 'collection_list', data: {} }] }] };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.collections.map((c) => c.handle)).toEqual(['best-sellers', 'new-arrivals']);
  });

  it('leaves an explicitly emptied list alone — does not force defaults back in', () => {
    const legacy = { pages: [{ id: 'home', sections: [{ id: 's', type: 'collection_list', data: { collections: [] } }] }] };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.collections).toEqual([]);
  });

  it('leaves an already-populated list untouched', () => {
    const legacy = {
      pages: [{ id: 'home', sections: [{ id: 's', type: 'collection_list', data: { collections: [{ id: 'x', source: 'catalog', handle: 'bags' }] } }] }],
    };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.collections).toEqual([{ id: 'x', source: 'catalog', handle: 'bags' }]);
  });
});

describe('migrateState — featured_products backfill', () => {
  it('folds old collection-mode fields (source/collection_handle/products_to_show) into `products`, dropping the old keys', () => {
    const legacy = {
      pages: [{
        id: 'home',
        sections: [{ id: 's', type: 'featured_products', data: { source: 'collection', collection_handle: 'tops', products_to_show: 2 } }],
      }],
    };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.products.map((p) => p.product_id)).toEqual(['p5', 'p6']);
    expect(sec.data.source).toBeUndefined();
    expect(sec.data.collection_handle).toBeUndefined();
    expect(sec.data.products_to_show).toBeUndefined();
  });

  it('defaults to the first catalog products when no source/collection is set', () => {
    const legacy = { pages: [{ id: 'home', sections: [{ id: 's', type: 'featured_products', data: {} }] }] };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.products.map((p) => p.product_id)).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('folds old manual-mode "product" blocks into custom `products` items, dropping the blocks', () => {
    const legacy = {
      pages: [{
        id: 'home',
        sections: [{
          id: 's',
          type: 'featured_products',
          data: { source_mode: 'manual' },
          blocks: [{ id: 'b1', type: 'product', data: { title: 'Hand-picked Hat', price: '19.99', url: '/x' } }],
        }],
      }],
    };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.products).toEqual([{ id: 'b1', source: 'custom', title: 'Hand-picked Hat', image: null, price: '19.99', url: '/x' }]);
    expect(sec.blocks).toEqual([]);
    expect(sec.data.source_mode).toBeUndefined();
  });

  it('leaves an already-populated `products` list untouched', () => {
    const legacy = {
      pages: [{ id: 'home', sections: [{ id: 's', type: 'featured_products', data: { products: [{ id: 'x', source: 'catalog', product_id: 'p2' }] } }] }],
    };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.products).toEqual([{ id: 'x', source: 'catalog', product_id: 'p2' }]);
  });
});
