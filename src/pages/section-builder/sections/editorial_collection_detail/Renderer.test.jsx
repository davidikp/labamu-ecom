import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditorialCollectionDetailRenderer from './Renderer';
import { groupGalleryRows } from '../shared/galleryRhythm';

const THEME = { colors: { primary: '#111', primary_text: '#fff' }, buttons: {} };

function img(name) {
  return { src: `${name}.png`, alt: `Alt text for ${name}` };
}

function formaCollection(overrides = {}) {
  return {
    id: '01',
    slug: 'forma',
    title: 'Forma',
    subtitle: 'Objects shaped by simplicity',
    coverImage: 'forma-cover.png',
    coverImageAlt: 'Forma cover alt',
    description: 'Forma explores simplicity.\nA second paragraph.',
    images: [img('forma-1'), img('forma-2'), img('forma-3')],
    cta: { enabled: true, label: 'View Products', href: '/shop' },
    ...overrides,
  };
}

describe('EditorialCollectionDetailRenderer — introduction', () => {
  it('renders the title, subtitle, and description paragraphs', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection()} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Forma' })).toBeTruthy();
    expect(screen.getByText('Objects shaped by simplicity')).toBeTruthy();
    expect(screen.getByText('Forma explores simplicity.')).toBeTruthy();
    expect(screen.getByText('A second paragraph.')).toBeTruthy();
  });

  it('hides the subtitle when show_subtitle is false', () => {
    render(<EditorialCollectionDetailRenderer data={{ show_subtitle: false }} theme={THEME} collection={formaCollection()} />);
    expect(screen.queryByText('Objects shaped by simplicity')).toBeNull();
  });

  it('hides the description when show_description is false', () => {
    render(<EditorialCollectionDetailRenderer data={{ show_description: false }} theme={THEME} collection={formaCollection()} />);
    expect(screen.queryByText('Forma explores simplicity.')).toBeNull();
  });
});

describe('EditorialCollectionDetailRenderer — hero image', () => {
  it('uses coverImage (and coverImageAlt) as the hero image when present', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection()} />);
    expect(screen.getByAltText('Forma cover alt').src).toContain('forma-cover.png');
  });

  it('falls back to the first gallery image (and its alt) when coverImage is absent', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection({ coverImage: null, coverImageAlt: null })} />);
    expect(screen.getByAltText('Alt text for forma-1').src).toContain('forma-1.png');
  });

  it('does not repeat the borrowed hero image inside the gallery below it', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection({ coverImage: null, coverImageAlt: null })} />);
    // forma-1 is used once (as the hero); the gallery below starts at forma-2.
    expect(screen.getAllByAltText('Alt text for forma-1')).toHaveLength(1);
    expect(screen.getByAltText('Alt text for forma-2')).toBeTruthy();
  });
});

describe('EditorialCollectionDetailRenderer — gallery', () => {
  it('renders the remaining gallery images with their own alt text', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection()} />);
    expect(screen.getByTestId('editorial-collection-gallery')).toBeTruthy();
    // Hero (coverImage) + 3 gallery images = 4 <img> total.
    expect(document.querySelectorAll('img').length).toBe(4);
    expect(screen.getByAltText('Alt text for forma-2')).toBeTruthy();
  });

  it('does not render a gallery section when there are no images', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection({ images: [] })} />);
    expect(screen.queryByTestId('editorial-collection-gallery')).toBeNull();
  });

});

describe('EditorialCollectionDetailRenderer — image captions', () => {
  it('renders a caption under an image that has one', () => {
    render(
      <EditorialCollectionDetailRenderer
        data={{}}
        theme={THEME}
        collection={formaCollection({ images: [{ ...img('forma-1'), caption: 'A quiet corner of the studio.' }, img('forma-2'), img('forma-3')] })}
      />
    );
    expect(screen.getByText('A quiet corner of the studio.')).toBeTruthy();
  });

  it('renders no caption element when an image has none', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection()} />);
    expect(document.querySelectorAll('figcaption').length).toBe(0);
  });

  it('never uses alt text as the visible caption (they serve different purposes)', () => {
    render(
      <EditorialCollectionDetailRenderer
        data={{}}
        theme={THEME}
        collection={formaCollection({ images: [{ src: 'forma-1.png', alt: 'Accessibility description', caption: 'Editorial caption' }, img('forma-2'), img('forma-3')] })}
      />
    );
    expect(screen.getByText('Editorial caption')).toBeTruthy();
    expect(screen.queryByText('Accessibility description')).toBeNull();
    expect(screen.getByAltText('Accessibility description')).toBeTruthy();
  });
});

describe('EditorialCollectionDetailRenderer — story blocks', () => {
  const storyBlock = { type: 'text', title: 'Material and Form', body: ['First paragraph.', 'Second paragraph.'] };

  it('renders a story block woven into the gallery rhythm', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection({ storyBlocks: [storyBlock] })} />);
    expect(screen.getByRole('heading', { name: 'Material and Form' })).toBeTruthy();
    expect(screen.getByText('First paragraph.')).toBeTruthy();
    expect(screen.getByText('Second paragraph.')).toBeTruthy();
  });

  it('renders nothing extra when storyBlocks is absent', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection()} />);
    expect(screen.queryByRole('heading', { name: 'Material and Form' })).toBeNull();
  });

  it('renders nothing extra when storyBlocks is an empty array', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection({ storyBlocks: [] })} />);
    expect(screen.queryByRole('heading', { name: 'Material and Form' })).toBeNull();
  });

  it('renders a second story block when present, alongside gallery images', () => {
    const second = { type: 'text', title: 'Second Chapter', body: ['More story.'] };
    render(
      <EditorialCollectionDetailRenderer
        data={{}}
        theme={THEME}
        collection={formaCollection({
          images: ['a', 'b', 'c', 'd', 'e', 'f'].map(img),
          storyBlocks: [storyBlock, second],
        })}
      />
    );
    expect(screen.getByRole('heading', { name: 'Material and Form' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Second Chapter' })).toBeTruthy();
    // All 6 gallery images still render alongside both story blocks.
    expect(screen.getAllByAltText(/Alt text for/).length).toBe(6);
  });
});

describe('groupGalleryRows — deterministic full/pair rhythm', () => {
  it('groups index 0 as full, 1-2 as a pair, 3 as full, 4-5 as a pair', () => {
    const images = ['a', 'b', 'c', 'd', 'e', 'f'].map(img);
    const rows = groupGalleryRows(images);
    expect(rows).toEqual([
      { type: 'full', items: [images[0]] },
      { type: 'pair', items: [images[1], images[2]], pairIndex: 0 },
      { type: 'full', items: [images[3]] },
      { type: 'pair', items: [images[4], images[5]], pairIndex: 1 },
    ]);
  });

  it('renders a trailing odd image full-width instead of a half-empty pair row', () => {
    const images = ['a', 'b'].map(img); // full[0], then only 1 left for what would be a pair row -> full
    const rows = groupGalleryRows(images);
    expect(rows).toEqual([
      { type: 'full', items: [images[0]] },
      { type: 'full', items: [images[1]] },
    ]);
    // No row ever has exactly one item under type 'pair'.
    expect(rows.every((row) => !(row.type === 'pair' && row.items.length !== 2))).toBe(true);
  });

  it('handles a single image gracefully', () => {
    const images = [img('solo')];
    expect(groupGalleryRows(images)).toEqual([{ type: 'full', items: images }]);
  });

  it('handles an empty array gracefully', () => {
    expect(groupGalleryRows([])).toEqual([]);
  });
});

describe('EditorialCollectionDetailRenderer — CTA', () => {
  it('renders the CTA as a real link and navigates to its href', () => {
    const onNavigate = vi.fn();
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection()} onNavigate={onNavigate} />);
    const cta = screen.getByRole('link', { name: 'View Products' });
    fireEvent.click(cta);
    expect(onNavigate).toHaveBeenCalledWith('/shop');
  });

  it('renders no CTA and reserves no extra space when the collection CTA is disabled', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection({ cta: { enabled: false, label: '', href: '' } })} />);
    expect(screen.queryByRole('link', { name: /view products/i })).toBeNull();
  });

  it('hides the CTA when show_cta is false even if the collection CTA is enabled', () => {
    render(<EditorialCollectionDetailRenderer data={{ show_cta: false }} theme={THEME} collection={formaCollection()} />);
    expect(screen.queryByRole('link', { name: 'View Products' })).toBeNull();
  });

  it('renders the CTA as inert text (no link) in the interactive builder with no onNavigate provided', () => {
    render(<EditorialCollectionDetailRenderer data={{}} theme={THEME} collection={formaCollection()} />);
    expect(screen.queryByRole('link', { name: 'View Products' })).toBeNull();
    expect(screen.getByText('View Products')).toBeTruthy();
  });
});
