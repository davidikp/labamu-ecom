import { describe, it, expect } from 'vitest';
import { resolveStorefrontProducts, resolveStorefrontProductByHandle, buildProductPath } from './productSource';
import { HOUZEZ_PRODUCTS } from '../../mocks/houzezProducts';
import catalogJson from '../../mocks/catalog.json';

describe('resolveStorefrontProducts', () => {
  it('falls back to the generic demo catalog when the theme sets no productCatalog (backward compatible)', () => {
    const products = resolveStorefrontProducts({});
    expect(products.length).toBe(catalogJson.products.length);
    expect(products.map((p) => p.id)).toEqual(catalogJson.products.map((p) => p.id));
    // Xinear/clothing-domain names still resolve from `name` untouched.
    expect(products[0].name).toBe(catalogJson.products[0].name);
  });

  it('falls back to the generic demo catalog when theme is undefined', () => {
    expect(resolveStorefrontProducts(undefined).length).toBe(catalogJson.products.length);
  });

  it("resolves the template's own productCatalog when the theme sets one (Houzez)", () => {
    const products = resolveStorefrontProducts({ productCatalog: HOUZEZ_PRODUCTS });
    expect(products.length).toBe(HOUZEZ_PRODUCTS.length);
    expect(products.map((p) => p.id)).toEqual(HOUZEZ_PRODUCTS.map((p) => p.id));
    // No clothing-domain products leak in.
    expect(products.some((p) => /tshirt|leggings|jeans/i.test(p.name))).toBe(false);
  });

  it('normalizes `title` (featured_products convention) to `name` for consumers that expect it', () => {
    const products = resolveStorefrontProducts({ productCatalog: [{ id: 'x1', title: 'A Ladder', image: null, price: 'Rp 1' }] });
    expect(products).toHaveLength(1);
    const [product] = products;
    // Pre-existing fields (RFQ's backward-compat contract) — same values,
    // same meaning, as before this module's Phase 1 extension.
    expect(product.id).toBe('x1');
    expect(product.name).toBe('A Ladder');
    expect(product.image).toBeNull();
    expect(product.price).toBe('Rp 1');
  });

  it('keeps the pre-existing id/name/image/price fields byte-for-byte for every generic-catalog product (RFQ backward compat)', () => {
    const products = resolveStorefrontProducts({});
    products.forEach((product, i) => {
      const original = catalogJson.products[i];
      expect(product.id).toBe(original.id);
      expect(product.name).toBe(original.name);
      expect(product.image).toBe(original.image);
      expect(product.price).toBe(original.price);
    });
  });

  it('derives a kebab-case handle from the product name when no explicit handle/slug exists', () => {
    const products = resolveStorefrontProducts({ productCatalog: [{ id: 'x1', name: 'Classic Tote Bag', price: 10 }] });
    expect(products[0].handle).toBe('classic-tote-bag');
  });

  it('prefers an explicit handle/slug field over a derived one', () => {
    const withHandle = resolveStorefrontProducts({ productCatalog: [{ id: 'x1', name: 'Classic Tote Bag', handle: 'ctb', price: 10 }] });
    expect(withHandle[0].handle).toBe('ctb');
    const withSlug = resolveStorefrontProducts({ productCatalog: [{ id: 'x1', name: 'Classic Tote Bag', slug: 'ctb-2', price: 10 }] });
    expect(withSlug[0].handle).toBe('ctb-2');
  });

  it('deterministically suffixes colliding derived handles in array order (-2, -3, ...)', () => {
    const products = resolveStorefrontProducts({
      productCatalog: [
        { id: 'a', name: 'Red Shirt', price: 1 },
        { id: 'b', name: 'Red Shirt', price: 1 },
        { id: 'c', name: 'Red Shirt', price: 1 },
      ],
    });
    expect(products.map((p) => p.handle)).toEqual(['red-shirt', 'red-shirt-2', 'red-shirt-3']);
  });

  it('produces the same handles on repeated calls (no randomness)', () => {
    const theme = { productCatalog: HOUZEZ_PRODUCTS };
    const first = resolveStorefrontProducts(theme).map((p) => p.handle);
    const second = resolveStorefrontProducts(theme).map((p) => p.handle);
    expect(second).toEqual(first);
  });

  it('normalizes images: preserves an existing images array, falls back to [image], else []', () => {
    const products = resolveStorefrontProducts({
      productCatalog: [
        { id: 'a', name: 'Has Images', images: ['/x.png', '/y.png'], price: 1 },
        { id: 'b', name: 'Has Image Only', image: '/z.png', price: 1 },
        { id: 'c', name: 'Has Neither', price: 1 },
      ],
    });
    expect(products[0].images).toEqual(['/x.png', '/y.png']);
    expect(products[1].images).toEqual(['/z.png']);
    expect(products[2].images).toEqual([]);
  });

  it('normalizes priceValue to a number for a plain-number price, without touching price itself', () => {
    const products = resolveStorefrontProducts({ productCatalog: [{ id: 'a', name: 'Numeric', price: 45 }] });
    expect(products[0].price).toBe(45);
    expect(products[0].priceValue).toBe(45);
  });

  it('best-effort normalizes a simple formatted-string price to a number', () => {
    const products = resolveStorefrontProducts({ productCatalog: [{ id: 'a', name: 'Formatted', price: '$45.50' }] });
    expect(products[0].price).toBe('$45.50');
    expect(products[0].priceValue).toBe(45.5);
  });

  it('correctly parses a Rupiah-style thousands-grouped price (Phase 2 fix)', () => {
    const products = resolveStorefrontProducts({ productCatalog: [{ id: 'a', name: 'Rupiah', price: 'Rp 4.200.000' }] });
    expect(products[0].price).toBe('Rp 4.200.000');
    expect(products[0].priceValue).toBe(4200000);
  });

  it('correctly parses Rupiah-style prices for every real Houzez product', () => {
    const products = resolveStorefrontProducts({ productCatalog: HOUZEZ_PRODUCTS });
    const ladder = products.find((p) => p.id === 'houzez-prod-ladder');
    expect(ladder.priceValue).toBe(4200000);
    const rammer = products.find((p) => p.id === 'houzez-prod-rammer');
    expect(rammer.priceValue).toBe(23330000);
    products.forEach((p) => expect(p.priceValue).not.toBeNull());
  });

  it('parses comma-grouped thousands ("4,200,000") the same way', () => {
    const products = resolveStorefrontProducts({ productCatalog: [{ id: 'a', name: 'Comma', price: '4,200,000' }] });
    expect(products[0].priceValue).toBe(4200000);
  });

  it('still parses a genuine decimal price correctly (not mistaken for thousands grouping)', () => {
    const products = resolveStorefrontProducts({ productCatalog: [{ id: 'a', name: 'Decimal', price: '12.5' }] });
    expect(products[0].priceValue).toBe(12.5);
  });
});

describe('buildProductPath', () => {
  it('builds the /products/:handle path for a given handle', () => {
    expect(buildProductPath('classic-tote-bag')).toBe('/products/classic-tote-bag');
  });
});

describe('resolveStorefrontProductByHandle', () => {
  it('resolves a known handle using the same normalization as resolveStorefrontProducts', () => {
    const theme = { productCatalog: [{ id: 'x1', name: 'Classic Tote Bag', price: 10 }] };
    const product = resolveStorefrontProductByHandle(theme, 'classic-tote-bag');
    expect(product?.id).toBe('x1');
  });

  it('returns null for an unknown handle', () => {
    expect(resolveStorefrontProductByHandle({}, 'not-a-real-handle')).toBeNull();
  });

  it('never throws and returns null for missing/empty handle', () => {
    expect(resolveStorefrontProductByHandle({})).toBeNull();
    expect(resolveStorefrontProductByHandle({}, '')).toBeNull();
    expect(() => resolveStorefrontProductByHandle(undefined, undefined)).not.toThrow();
  });
});
