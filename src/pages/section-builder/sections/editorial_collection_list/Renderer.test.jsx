import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditorialCollectionListRenderer from './Renderer';
import { EDITORIAL_COLLECTIONS, buildEditorialCollectionPath } from '../shared/editorialCollections';

describe('EditorialCollectionListRenderer — cards', () => {
  it('renders one card per collection in the shared mock dataset', () => {
    render(<EditorialCollectionListRenderer data={{}} />);
    for (const collection of EDITORIAL_COLLECTIONS) {
      expect(screen.getByText(collection.title)).toBeTruthy();
    }
  });

  it('renders each collection title and subtitle', () => {
    render(<EditorialCollectionListRenderer data={{}} />);
    const forma = EDITORIAL_COLLECTIONS.find((c) => c.slug === 'forma');
    expect(screen.getByText(forma.title)).toBeTruthy();
    expect(screen.getByText(forma.subtitle)).toBeTruthy();
  });

  it('renders each cover image with its own meaningful alt text (not a generic reused string)', () => {
    render(<EditorialCollectionListRenderer data={{}} />);
    const forma = EDITORIAL_COLLECTIONS.find((c) => c.slug === 'forma');
    const img = screen.getByAltText(forma.coverImageAlt);
    expect(img.src).toBe(forma.coverImage);
    const altTexts = new Set(EDITORIAL_COLLECTIONS.map((c) => c.coverImageAlt));
    expect(altTexts.size).toBe(EDITORIAL_COLLECTIONS.length); // every alt is distinct
  });

  it('navigates to /collection/:slug when a card is activated', () => {
    const onNavigate = vi.fn();
    render(<EditorialCollectionListRenderer data={{}} onNavigate={onNavigate} />);
    const forma = EDITORIAL_COLLECTIONS.find((c) => c.slug === 'forma');
    fireEvent.click(screen.getByText(forma.title));
    expect(onNavigate).toHaveBeenCalledWith(buildEditorialCollectionPath('forma'));
  });

  it('renders cards as real links (not clickable divs/buttons) with the correct href', () => {
    render(<EditorialCollectionListRenderer data={{}} onNavigate={() => {}} />);
    const grid = screen.getByTestId('editorial-collection-grid');
    const links = grid.querySelectorAll('a');
    expect(links.length).toBe(EDITORIAL_COLLECTIONS.length);
    const forma = EDITORIAL_COLLECTIONS.find((c) => c.slug === 'forma');
    const formaLink = screen.getByText(forma.title).closest('a');
    expect(formaLink.getAttribute('href')).toBe('/collection/forma');
  });

  it('renders inert (non-link) cards in the interactive builder canvas with no onNavigate provided', () => {
    render(<EditorialCollectionListRenderer data={{}} />);
    const grid = screen.getByTestId('editorial-collection-grid');
    expect(grid.querySelectorAll('a').length).toBe(0);
  });
});

describe('EditorialCollectionListRenderer — heading', () => {
  it('renders a default heading when none is set', () => {
    render(<EditorialCollectionListRenderer data={{}} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Our Collections' })).toBeTruthy();
  });

  it('renders a custom heading and description', () => {
    render(<EditorialCollectionListRenderer data={{ heading: 'Collections', description: 'A curated exploration of materials, forms, and spaces.' }} />);
    expect(screen.getByText('Collections')).toBeTruthy();
    expect(screen.getByText('A curated exploration of materials, forms, and spaces.')).toBeTruthy();
  });

  it('hides the heading area when show_heading is false', () => {
    render(<EditorialCollectionListRenderer data={{ show_heading: false, heading: 'Collections' }} />);
    expect(screen.queryByText('Collections')).toBeNull();
  });
});

describe('EditorialCollectionListRenderer — grid columns', () => {
  it('resolves 2 desktop columns by default (editorial index, not a dense grid)', () => {
    render(<EditorialCollectionListRenderer data={{}} breakpoint="desktop" />);
    expect(screen.getByTestId('editorial-collection-grid').className).toContain('grid-cols-2');
  });

  it('supports an explicit 3-column desktop layout', () => {
    render(<EditorialCollectionListRenderer data={{ columns_desktop: '3' }} breakpoint="desktop" />);
    expect(screen.getByTestId('editorial-collection-grid').className).toContain('grid-cols-3');
  });

  it('keeps 2 columns at tablet breakpoint', () => {
    render(<EditorialCollectionListRenderer data={{}} breakpoint="tablet" />);
    expect(screen.getByTestId('editorial-collection-grid').className).toContain('grid-cols-2');
  });

  it('collapses to a single column at mobile breakpoint', () => {
    render(<EditorialCollectionListRenderer data={{}} breakpoint="mobile" />);
    expect(screen.getByTestId('editorial-collection-grid').className).toContain('grid-cols-1');
  });
});
