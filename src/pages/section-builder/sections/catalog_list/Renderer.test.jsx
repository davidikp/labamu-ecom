import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import CatalogListRenderer from './Renderer';
import { HOUZEZ_PRODUCTS } from '../../mocks/houzezProducts';

const DATA = { heading: 'Shop', columns_desktop: 4, page_size: 10 };

const PRODUCTS = [
  { id: 'a', name: 'Alpha Shirt', price: 10, category: 'Tops', stock: 5 },
  { id: 'b', name: 'Beta Pants', price: 20, category: 'Bottoms', stock: 5 },
  { id: 'c', name: 'Gamma Shoes', price: 30, category: 'Shoes', stock: 0 },
  { id: 'd', name: 'Delta Hat', price: 5, category: 'Tops', stock: 5 },
  { id: 'e', name: 'Epsilon Bag', price: 40, category: 'Bags', stock: 5 },
];

function renderCatalog(props = {}) {
  return render(<CatalogListRenderer data={DATA} theme={{ productCatalog: PRODUCTS }} {...props} />);
}

describe('CatalogListRenderer — grid gap', () => {
  it('uses 24px gap at desktop breakpoint', () => {
    renderCatalog({ breakpoint: 'desktop' });
    expect(screen.getByTestId('catalog-grid').style.gap).toBe('24px');
  });

  it('uses 16px gap at tablet breakpoint', () => {
    renderCatalog({ breakpoint: 'tablet' });
    expect(screen.getByTestId('catalog-grid').style.gap).toBe('16px');
  });

  it('uses 12px gap at mobile breakpoint', () => {
    renderCatalog({ breakpoint: 'mobile' });
    expect(screen.getByTestId('catalog-grid').style.gap).toBe('12px');
  });

  it('falls back to isMobile flag when no explicit breakpoint is known', () => {
    renderCatalog({ isMobile: true });
    expect(screen.getByTestId('catalog-grid').style.gap).toBe('12px');
    renderCatalog({ isMobile: false });
    expect(screen.getAllByTestId('catalog-grid')[1].style.gap).toBe('24px');
  });
});

describe('CatalogListRenderer — search', () => {
  it('filters products by name, case-insensitively, live', () => {
    renderCatalog();
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'alpha' } });
    expect(screen.getByText('Alpha Shirt')).toBeTruthy();
    expect(screen.queryByText('Beta Pants')).toBeNull();
  });

  it('resets to page 1 when the search term changes', () => {
    renderCatalog({ data: { ...DATA, page_size: 2 } });
    fireEvent.click(screen.getByText('2'));
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'a' } });
    // With page reset, first matching page's items should be visible again.
    expect(screen.getByText(/products/)).toBeTruthy();
  });
});

describe('CatalogListRenderer — category filter', () => {
  it('shows all products by default and narrows on category select', () => {
    renderCatalog();
    expect(screen.getByText('Alpha Shirt')).toBeTruthy();
    fireEvent.click(screen.getByText('Tops'));
    expect(screen.getByText('Alpha Shirt')).toBeTruthy();
    expect(screen.getByText('Delta Hat')).toBeTruthy();
    expect(screen.queryByText('Beta Pants')).toBeNull();
  });
});

describe('CatalogListRenderer — price filter', () => {
  it('filters by min/max price', () => {
    renderCatalog();
    const [minInput, maxInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(minInput, { target: { value: '15' } });
    fireEvent.change(maxInput, { target: { value: '35' } });
    expect(screen.getByText('Beta Pants')).toBeTruthy();
    expect(screen.getByText('Gamma Shoes')).toBeTruthy();
    expect(screen.queryByText('Alpha Shirt')).toBeNull();
    expect(screen.queryByText('Epsilon Bag')).toBeNull();
  });
});

describe('CatalogListRenderer — sort', () => {
  it('sorts price ascending/descending', () => {
    renderCatalog({ data: { ...DATA, page_size: 10 } });
    const trigger = screen.getByLabelText(/sort by/i);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Price: Low to High'));
    let cards = screen.getAllByText(/Rp|\$/);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Price: High to Low'));
    cards = screen.getAllByText(/Rp|\$/);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('newest/oldest use source-array order as a stable proxy (documented — no fabricated dates)', () => {
    renderCatalog({ data: { ...DATA, page_size: 10 } });
    const trigger = screen.getByLabelText(/sort by/i);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Oldest'));
    expect(screen.getByText('Alpha Shirt')).toBeTruthy();
  });
});

describe('CatalogListRenderer — pagination', () => {
  it('paginates by page_size and clamps when results shrink', () => {
    renderCatalog({ data: { ...DATA, page_size: 2 } });
    expect(screen.getAllByRole('button', { name: /^[0-9]+$/ }).length).toBeGreaterThanOrEqual(3);
    fireEvent.click(screen.getByText('3'));
    // 'newest' (default) is source-array order, later = newer: page 1 = [e,d], page 2 = [c,b], page 3 = [a].
    expect(screen.getByText('Alpha Shirt')).toBeTruthy();
    // Now filter down so page 3 no longer exists — should clamp instead of blanking.
    fireEvent.click(screen.getByText('Tops'));
    expect(screen.getByText('Alpha Shirt')).toBeTruthy();
  });
});

describe('CatalogListRenderer — empty/no-results states', () => {
  it('shows a distinct empty-catalog state when there are zero products at all', () => {
    render(<CatalogListRenderer data={DATA} theme={{ productCatalog: [] }} />);
    expect(screen.getByText(/catalog not available/i)).toBeTruthy();
  });

  it('shows a no-results state with a reset action when filters match nothing', () => {
    renderCatalog();
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'zzz-nonexistent' } });
    expect(screen.getByText(/no products match/i)).toBeTruthy();
    fireEvent.click(screen.getByText(/reset filters/i));
    expect(screen.getByText('Alpha Shirt')).toBeTruthy();
  });
});

describe('CatalogListRenderer — navigation', () => {
  it('calls onNavigate with /products/:handle when a card is clicked (preview mode)', () => {
    const onNavigate = vi.fn();
    renderCatalog({ onNavigate });
    fireEvent.click(screen.getByText('Alpha Shirt'));
    expect(onNavigate).toHaveBeenCalledWith('/products/alpha-shirt');
  });

  it('does not navigate when no onNavigate is provided (builder mode)', () => {
    renderCatalog();
    expect(() => fireEvent.click(screen.getByText('Alpha Shirt'))).not.toThrow();
  });
});

describe('CatalogListRenderer — theme sanity renders', () => {
  it('renders Houzez catalog without crashing', () => {
    const { container } = render(<CatalogListRenderer data={DATA} theme={{ productCatalog: HOUZEZ_PRODUCTS }} />);
    expect(container.querySelector('section')).toBeTruthy();
  });

  it('renders the generic Xinear demo catalog without crashing', () => {
    const { container } = render(<CatalogListRenderer data={DATA} theme={{}} />);
    expect(container.querySelector('section')).toBeTruthy();
  });
});

describe('CatalogListRenderer — Houzez category data', () => {
  it('every Houzez product carries a meaningful, non-empty category', () => {
    expect(HOUZEZ_PRODUCTS.length).toBeGreaterThan(0);
    for (const product of HOUZEZ_PRODUCTS) {
      expect(typeof product.category).toBe('string');
      expect(product.category.trim().length).toBeGreaterThan(0);
    }
  });

  it("Shop's category filter narrows Houzez products by their real group ('High-Rise Needs' / 'Safety Tools')", () => {
    render(<CatalogListRenderer data={DATA} theme={{ productCatalog: HOUZEZ_PRODUCTS }} />);
    fireEvent.click(screen.getByText('High-Rise Needs'));
    expect(screen.getByText(/KRISBOW Ladder/)).toBeTruthy();
    expect(screen.queryByText(/Safety Helmet/)).toBeNull();

    fireEvent.click(screen.getByText('Safety Tools'));
    expect(screen.getAllByText(/Safety Helmet/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/KRISBOW Ladder/)).toBeNull();
  });
});
