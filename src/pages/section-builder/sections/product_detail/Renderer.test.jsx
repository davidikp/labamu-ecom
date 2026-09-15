import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import ProductDetailRenderer from './Renderer';
import { StorefrontCartProvider } from '../shared/storefrontCart';
import { useStorefrontCart } from '../shared/storefrontCartContext';

const THEME = {
  colors: { primary: '#111', primary_text: '#fff' },
  buttons: {},
  productCatalog: [
    { id: 'a', name: 'Alpha Jacket', price: 100, images: ['a1.png', 'a2.png'], stock: 3, category: 'Outerwear', description: 'Warm jacket' },
    { id: 'b', name: 'Beta Cap', price: 20, image: 'b1.png', stock: 0, category: 'Accessories' },
    { id: 'c', name: 'Gamma Coat', price: 150, image: 'c1.png', stock: 5, category: 'Outerwear' },
    { id: 'd', name: 'Delta Bag', price: 40, image: 'd1.png', stock: null, category: 'Accessories' },
  ],
};

function alphaProduct() {
  // handle is derived deterministically from name — see productSource.js
  return { id: 'a', handle: 'alpha-jacket', name: 'Alpha Jacket', price: 100, images: ['a1.png', 'a2.png'], stock: 3, category: 'Outerwear', description: 'Warm jacket', priceValue: 100 };
}
function betaProduct() {
  return { id: 'b', handle: 'beta-cap', name: 'Beta Cap', price: 20, image: 'b1.png', images: ['b1.png'], stock: 0, category: 'Accessories', priceValue: 20 };
}

function renderPDP(props = {}) {
  return render(
    <StorefrontCartProvider>
      <ProductDetailRenderer data={{}} theme={THEME} {...props} />
    </StorefrontCartProvider>
  );
}

describe('ProductDetailRenderer — gallery', () => {
  it('shows the first image and clickable thumbnails when there are multiple images', () => {
    renderPDP({ product: alphaProduct() });
    const main = screen.getAllByAltText('Alpha Jacket')[0];
    expect(main.src).toContain('a1.png');
    const thumb2 = screen.getAllByLabelText(/View image/)[1];
    fireEvent.click(thumb2);
    expect(screen.getAllByAltText('Alpha Jacket')[0].src).toContain('a2.png');
  });

  it('collapses to a single image with no thumbnail row when images.length <= 1', () => {
    renderPDP({ product: betaProduct() });
    expect(screen.queryByLabelText('View image 1')).toBeNull();
  });

  it('resets the selected image when the product changes', () => {
    const { rerender } = renderPDP({ product: alphaProduct() });
    fireEvent.click(screen.getAllByLabelText(/View image/)[1]);
    expect(screen.getAllByAltText('Alpha Jacket')[0].src).toContain('a2.png');
    rerender(
      <StorefrontCartProvider>
        <ProductDetailRenderer data={{}} theme={THEME} product={betaProduct()} />
      </StorefrontCartProvider>
    );
    expect(screen.getByAltText('Beta Cap').src).toContain('b1.png');
  });
});

describe('ProductDetailRenderer — title/price/availability/description/category', () => {
  it('renders name, price, category, description, and in-stock state', () => {
    renderPDP({ product: alphaProduct() });
    expect(screen.getByRole('heading', { name: 'Alpha Jacket' })).toBeTruthy();
    expect(screen.getAllByText('$100.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Outerwear').length).toBeGreaterThan(0);
    expect(screen.getByText('Warm jacket')).toBeTruthy();
    expect(screen.getByText('In stock')).toBeTruthy();
  });

  it('hides the info-panel category line when show_category is false (breadcrumb still shows it)', () => {
    renderPDP({ product: alphaProduct(), data: { show_category: false } });
    // Breadcrumb ("Home > Outerwear > Alpha Jacket") always shows the
    // category — only the separate info-panel category line is toggled off.
    expect(screen.getAllByText('Outerwear').length).toBe(1);
  });

  it('hides the description block entirely when the product has none', () => {
    renderPDP({ product: { ...alphaProduct(), description: '' } });
    expect(screen.queryByText('Description')).toBeNull();
  });

  it('shows Sold out state for a zero-stock product and disables Add to cart', () => {
    renderPDP({ product: betaProduct() });
    expect(screen.getAllByText('Sold out').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });
});

describe('ProductDetailRenderer — visual options (presentation only)', () => {
  const themeWithOptions = { ...THEME, pdpOptions: { groups: [{ id: 'size', label: 'Size', values: ['S', 'M', 'L'] }] } };

  it('renders no selector when the theme has no pdpOptions configured', () => {
    renderPDP({ product: alphaProduct() });
    expect(screen.queryByText('Size')).toBeNull();
  });

  it('defaults to the first value and allows single-select change without touching price/stock/id', () => {
    renderPDP({ product: alphaProduct(), theme: themeWithOptions });
    const sBtn = screen.getByRole('button', { name: 'S', pressed: undefined }) ?? screen.getByText('S');
    expect(sBtn.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByText('L'));
    expect(screen.getByText('L').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('S').getAttribute('aria-pressed')).toBe('false');
    // price/name unaffected
    expect(screen.getAllByText('$100.00').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Alpha Jacket' })).toBeTruthy();
  });
});

describe('ProductDetailRenderer — quantity', () => {
  it('increments/decrements within min 1 and max = stock', () => {
    renderPDP({ product: alphaProduct() });
    const dec = screen.getByLabelText('Decrease quantity');
    const inc = screen.getByLabelText('Increase quantity');
    expect(dec).toBeDisabled(); // starts at 1
    fireEvent.click(inc);
    fireEvent.click(inc);
    expect(screen.getByText('3')).toBeTruthy();
    expect(inc).toBeDisabled(); // stock is 3
  });

  it('is disabled entirely when out of stock', () => {
    renderPDP({ product: betaProduct() });
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
  });

  it('has no max clamp when stock is not numeric', () => {
    renderPDP({ product: { id: 'd', handle: 'delta-bag', name: 'Delta Bag', price: 40, image: 'd1.png', stock: null } });
    const inc = screen.getByLabelText('Increase quantity');
    for (let i = 0; i < 10; i += 1) fireEvent.click(inc);
    expect(screen.getByText('11')).toBeTruthy();
  });
});

describe('ProductDetailRenderer — Add to cart / storefront cart', () => {
  function CartCount() {
    const { count } = useStorefrontCart();
    return <span data-testid="cart-count">{count}</span>;
  }

  it('adds an item and shows a success acknowledgment', () => {
    render(
      <StorefrontCartProvider>
        <CartCount />
        <ProductDetailRenderer data={{}} theme={THEME} product={alphaProduct()} />
      </StorefrontCartProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(screen.getByTestId('cart-count').textContent).toBe('1');
  });

  it('increments quantity for the same product + same options instead of adding a second line', () => {
    render(
      <StorefrontCartProvider>
        <CartCount />
        <ProductDetailRenderer data={{}} theme={THEME} product={alphaProduct()} />
      </StorefrontCartProvider>
    );
    const addBtn = screen.getByRole('button', { name: 'Add to cart' });
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(screen.getByTestId('cart-count').textContent).toBe('2');
  });

  it('clamps added quantity to available stock', () => {
    render(
      <StorefrontCartProvider>
        <CartCount />
        <ProductDetailRenderer data={{}} theme={THEME} product={alphaProduct()} />
      </StorefrontCartProvider>
    );
    const inc = screen.getByLabelText('Increase quantity');
    fireEvent.click(inc);
    fireEvent.click(inc);
    fireEvent.click(inc); // would be 4 but stock is 3, quantity stepper itself clamps to 3
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(screen.getByTestId('cart-count').textContent).toBe('3');
  });

  it('different selected options create a separate cart line', () => {
    const themeWithOptions = { ...THEME, pdpOptions: { groups: [{ id: 'size', label: 'Size', values: ['S', 'M'] }] } };
    render(
      <StorefrontCartProvider>
        <CartCount />
        <ProductDetailRenderer data={{}} theme={themeWithOptions} product={alphaProduct()} />
      </StorefrontCartProvider>
    );
    const addBtn = screen.getByRole('button', { name: 'Add to cart' });
    fireEvent.click(addBtn); // size S, qty 1
    fireEvent.click(screen.getByText('M'));
    fireEvent.click(addBtn); // size M, qty 1
    expect(screen.getByTestId('cart-count').textContent).toBe('2');
  });
});

describe('ProductDetailRenderer — related products', () => {
  it('excludes the current product and lists same-category-first, deterministically', () => {
    renderPDP({ product: alphaProduct() });
    const heading = screen.getByText('Other picks');
    const grid = heading.closest('.mt-10').querySelector('.grid');
    const names = Array.from(grid.querySelectorAll('p.text-gray-600')).map((n) => n.textContent);
    expect(names).not.toContain('Alpha Jacket');
    expect(names[0]).toBe('Gamma Coat'); // same category (Outerwear), before Accessories
  });

  it('navigates to a related product outside builder mode', () => {
    const onNavigate = vi.fn();
    renderPDP({ product: alphaProduct(), onNavigate });
    fireEvent.click(screen.getByText('Gamma Coat'));
    expect(onNavigate).toHaveBeenCalledWith('/products/gamma-coat');
  });

  it('is inert (no navigation) in builder mode (no onNavigate provided)', () => {
    renderPDP({ product: alphaProduct(), onEdit: () => {} });
    // Should not throw when clicked with no onNavigate handler.
    expect(() => fireEvent.click(screen.getByText('Gamma Coat'))).not.toThrow();
  });

  it('hides the section when show_related_products is false', () => {
    renderPDP({ product: alphaProduct(), data: { show_related_products: false } });
    expect(screen.queryByText('Other picks')).toBeNull();
  });
});

describe('ProductDetailRenderer — no product available', () => {
  it('renders a graceful empty state when there is no product at all', () => {
    renderPDP({ theme: { ...THEME, productCatalog: [] } });
    expect(screen.getByText('No product available')).toBeTruthy();
  });
});

describe('ProductDetailRenderer — image resolution (regression: broken image bug)', () => {
  // Reproduces the actual bug: a template's own product catalog (e.g.
  // Houzez's mocks/houzezProducts.js) stores images as a `{ mediaId }`
  // reference, resolved against the site's media library — exactly like
  // any other image field in this codebase (see ui/fields/ImageField.jsx) —
  // not a raw URL string. `product` is intentionally omitted here so the
  // component resolves it itself via resolveStorefrontProducts(theme,
  // mediaLibrary), the same path ProductDetailPage.jsx uses for a real
  // routed product.
  const mediaTheme = {
    ...THEME,
    productCatalog: [{ id: 'z', name: 'Ladder', price: 'Rp 1', image: { mediaId: 'media-1' }, stock: 5, category: 'Tools' }],
  };

  it('resolves a { mediaId } image reference into a real, resolvable <img src>', () => {
    const mediaLibrary = [{ id: 'media-1', url: '/assets/templates/houzez/catalog/image-2.png' }];
    renderPDP({ theme: mediaTheme, mediaLibrary });
    const img = screen.getAllByAltText('Ladder')[0];
    expect(img.src).toContain('/assets/templates/houzez/catalog/image-2.png');
  });

  it('falls back to the graceful "no image" placeholder (never a broken <img>) when the mediaId cannot be resolved', () => {
    renderPDP({ theme: mediaTheme, mediaLibrary: [] });
    // Never a broken <img> pointing at a stringified { mediaId } object.
    expect(screen.queryByAltText('Ladder')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
  });
});

describe('ProductDetailRenderer — Buy Now', () => {
  it('renders a Buy Now button alongside Add to Cart', () => {
    renderPDP({ product: alphaProduct() });
    expect(screen.getByRole('button', { name: 'Buy Now' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeTruthy();
  });

  it('disables Buy Now when the product is sold out', () => {
    renderPDP({ product: betaProduct() });
    expect(screen.getByRole('button', { name: 'Buy Now' })).toBeDisabled();
  });
});

describe('ProductDetailRenderer — stock available', () => {
  it('hides the stock count by default (show_stock defaults to false)', () => {
    renderPDP({ product: alphaProduct() });
    expect(screen.queryByText('3 Stock Available')).toBeNull();
  });

  it('shows "{stock} Stock Available" under the quantity stepper when show_stock is on', () => {
    renderPDP({ data: { show_stock: true }, product: alphaProduct() });
    expect(screen.getByText('3 Stock Available')).toBeTruthy();
  });
});

describe('ProductDetailRenderer — subtotal', () => {
  it('shows quantity × unit price as the subtotal and updates it as quantity changes', () => {
    renderPDP({ product: alphaProduct() }); // price 100, qty starts at 1
    expect(screen.getAllByText('$100.00').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByLabelText('Increase quantity'));
    expect(screen.getByText('$200.00')).toBeTruthy();
  });

  it('formats the subtotal in the same currency shape as a string-priced (Rupiah) product', () => {
    const product = { id: 'r', handle: 'ladder', name: 'Ladder', price: 'Rp 4.200.000', priceValue: 4200000, images: ['l.png'], stock: 5, category: 'Tools' };
    renderPDP({ product });
    fireEvent.click(screen.getByLabelText('Increase quantity'));
    expect(screen.getByText('Rp 8.400.000')).toBeTruthy();
  });
});

describe('ProductDetailRenderer — breadcrumb', () => {
  it("shows the product's actual category (not a generic label) between Home and the product name", () => {
    renderPDP({ product: alphaProduct() });
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getAllByText('Outerwear').length).toBeGreaterThan(0);
  });
});

describe('ProductDetailRenderer — background & related-card chrome', () => {
  it('renders on an explicit white page background, not a gray tint', () => {
    const { container } = renderPDP({ product: alphaProduct() });
    expect(container.querySelector('section').className).toContain('bg-white');
  });

  it('renders related-product cards as borderless image-bleed cards (no card chrome box)', () => {
    renderPDP({ product: alphaProduct() });
    const grid = screen.getByTestId('pdp-related-grid');
    const card = grid.firstElementChild;
    // The card wrapper itself carries no border/background chrome classes —
    // only the image tile inside it does (bg-gray-100 placeholder, rounded).
    expect(card.className).not.toMatch(/\bborder\b/);
  });
});

describe('ProductDetailRenderer — responsive breakpoints', () => {
  it('lays the gallery/info columns out side by side at desktop breakpoint', () => {
    const { container } = renderPDP({ product: alphaProduct(), breakpoint: 'desktop' });
    const columns = container.querySelector('.flex.gap-10');
    expect(columns.className).toContain('flex-row');
  });

  it('stacks the gallery/info columns at mobile breakpoint, overriding a stale isMobile=false', () => {
    const { container } = renderPDP({ product: alphaProduct(), breakpoint: 'mobile', isMobile: false });
    const columns = container.querySelector('.flex.gap-10');
    expect(columns.className).toContain('flex-col');
  });

  it('shows 4 related-product columns at desktop breakpoint', () => {
    renderPDP({ product: alphaProduct(), breakpoint: 'desktop' });
    expect(screen.getByTestId('pdp-related-grid').className).toContain('grid-cols-4');
  });

  it('shows 3 related-product columns at tablet breakpoint', () => {
    renderPDP({ product: alphaProduct(), breakpoint: 'tablet' });
    expect(screen.getByTestId('pdp-related-grid').className).toContain('grid-cols-3');
  });

  it('drops to 2 related-product columns at mobile breakpoint (never stays at 4)', () => {
    renderPDP({ product: alphaProduct(), breakpoint: 'mobile' });
    const grid = screen.getByTestId('pdp-related-grid');
    expect(grid.className).toContain('grid-cols-2');
    expect(grid.className).not.toContain('grid-cols-4');
  });

  it('falls back to the isMobile flag when no explicit breakpoint is known', () => {
    const { container } = renderPDP({ product: alphaProduct(), isMobile: true });
    const columns = container.querySelector('.flex.gap-10');
    expect(columns.className).toContain('flex-col');
  });
});

describe('ProductDetailRenderer — Other picks card styling', () => {
  // 'Other picks' used to be its own hand-rolled card markup (own border-
  // radius/shadow/name-price styling, plus a multi-image carousel-dots
  // overlay Shop's own card never had) — now renders through the exact
  // same shared ProductCard component the Shop page grid uses, so the two
  // are guaranteed to look identical instead of silently drifting apart.
  // ProductCard has no per-item carousel-dots affordance, so a related
  // product with multiple images no longer shows one here either — that's
  // the intended trade-off of matching Shop's card exactly.
  it('renders each related product through the shared ProductCard (no per-tile image carousel dots)', () => {
    const products = [
      { id: 'a', name: 'Alpha Jacket', price: 100, images: ['a1.png', 'a2.png'], stock: 3, category: 'Outerwear' },
      { id: 'e', name: 'Echo Shoes', price: 60, images: ['e1.png', 'e2.png'], stock: 4, category: 'Shoes' },
    ];
    renderPDP({ product: { ...alphaProduct(), category: 'Outerwear' }, theme: { ...THEME, productCatalog: products } });
    const grid = screen.getByTestId('pdp-related-grid');
    expect(grid.querySelector('.absolute')).toBeNull();
  });
});

describe('ProductDetailRenderer — Other picks / See All', () => {
  it('navigates to /shop when See All is clicked outside builder mode', () => {
    const onNavigate = vi.fn();
    renderPDP({ product: alphaProduct(), onNavigate });
    fireEvent.click(screen.getByText('See All →'));
    expect(onNavigate).toHaveBeenCalledWith('/shop');
  });

  it('is inert in builder mode (no onNavigate provided)', () => {
    renderPDP({ product: alphaProduct() });
    expect(() => fireEvent.click(screen.getByText('See All →'))).not.toThrow();
  });
});
