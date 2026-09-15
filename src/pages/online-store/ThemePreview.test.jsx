import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ThemePreview from './ThemePreview';

function renderPreview(templateId, initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry ?? `/online-store/theme/${templateId}/preview`]}>
      <Routes>
        <Route path="/online-store/theme/:templateId/preview" element={<ThemePreview />} />
      </Routes>
    </MemoryRouter>
  );
}

// catalog_list/Renderer.jsx's own search input placeholder is the Shop
// system page's unique, unambiguous smoke marker — its heading text ("Shop")
// would otherwise collide with the "Shop" nav link itself.
const SHOP_MARKER = 'Search products';

describe('ThemePreview — Shop nav navigation regression (Houzez)', () => {
  it('navigates from Home to Shop by clicking the header nav link', () => {
    renderPreview('houzez');
    expect(screen.queryByPlaceholderText(SHOP_MARKER)).toBeNull();
    const shopLinks = screen.getAllByText('Shop');
    expect(shopLinks.length).toBeGreaterThan(0);
    fireEvent.click(shopLinks[0]);
    expect(screen.getByPlaceholderText(SHOP_MARKER)).toBeTruthy();
  });

  it('navigates back Shop -> Home after starting on Shop', () => {
    renderPreview('houzez', '/online-store/theme/houzez/preview?path=%2Fshop');
    expect(screen.getByPlaceholderText(SHOP_MARKER)).toBeTruthy();
    fireEvent.click(screen.getAllByText('Home')[0]);
    expect(screen.queryByPlaceholderText(SHOP_MARKER)).toBeNull();
  });

  it('resolves /shop directly via the ?path= query param (direct-URL-entry equivalent)', () => {
    renderPreview('houzez', '/online-store/theme/houzez/preview?path=%2Fshop');
    expect(screen.getByPlaceholderText(SHOP_MARKER)).toBeTruthy();
  });

  it('still renders Home content by default and can navigate to Shop for another single-page template (Xinear)', () => {
    renderPreview('xinear');
    expect(screen.queryByPlaceholderText(SHOP_MARKER)).toBeNull();
    const shopLinks = screen.getAllByText('Shop');
    expect(shopLinks.length).toBeGreaterThan(0);
    fireEvent.click(shopLinks[0]);
    expect(screen.getByPlaceholderText(SHOP_MARKER)).toBeTruthy();
  });
});

describe('ThemePreview — Product Detail Page routing (Phase 3)', () => {
  it('renders the real PDP for a valid product handle (clothing catalog fallback)', () => {
    renderPreview('clothing', '/online-store/theme/clothing/preview?path=%2Fproducts%2Fclassic-tote-bag');
    expect(screen.getByRole('heading', { name: 'Classic Tote Bag' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeTruthy();
  });

  it('renders a Not Found state for an unknown handle', () => {
    renderPreview('clothing', '/online-store/theme/clothing/preview?path=%2Fproducts%2Fdoes-not-exist');
    expect(screen.getByText('Product Not Found')).toBeTruthy();
    fireEvent.click(screen.getByText('Back to shop'));
    expect(screen.getByPlaceholderText(SHOP_MARKER)).toBeTruthy();
  });

  it('navigates from a Shop grid card into its PDP', () => {
    renderPreview('clothing', '/online-store/theme/clothing/preview?path=%2Fshop');
    // 'Classic Tote Bag' (catalog.json's p1) is no longer on the default
    // 'Newest' first page now that the shared demo catalog has more than a
    // page_size worth of products (Dresses/Shoes/Bags/Perfumes dummy data
    // added alongside it) — sort 'Oldest' to bring source-array order (p1
    // first) back to the front, same as a merchant would.
    fireEvent.click(screen.getByLabelText(/sort by/i));
    fireEvent.click(screen.getByText('Oldest'));
    fireEvent.click(screen.getByText('Classic Tote Bag'));
    expect(screen.getByRole('heading', { name: 'Classic Tote Bag' })).toBeTruthy();
  });
});
