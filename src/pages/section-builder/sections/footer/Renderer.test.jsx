import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import FooterRenderer from './Renderer';

const DATA = {
  link_columns: [
    { id: 'col1', heading: 'Shop', links: [{ id: 'l1', label: 'About', url: '/about' }] },
  ],
};

const MEDIA_LIBRARY = [{ id: 'media-logo', url: '/logo.png' }];
const LOGO_IMAGE_REF = { mediaId: 'media-logo' };

describe('FooterRenderer — nav link clicking', () => {
  it('renders links as plain text (no onNavigate) inside the interactive builder', () => {
    const { container } = render(<FooterRenderer data={DATA} />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.textContent).toContain('About');
  });

  it('renders links as clickable anchors and calls onNavigate with the link URL, without a real page navigation', () => {
    const onNavigate = vi.fn();
    const { getByText } = render(<FooterRenderer data={DATA} onNavigate={onNavigate} />);
    const link = getByText('About');
    expect(link.tagName).toBe('A');
    const event = fireEvent.click(link);
    expect(onNavigate).toHaveBeenCalledWith('/about');
    expect(event).toBe(false);
  });
});

describe('FooterRenderer — column_ratio', () => {
  it('defaults to equal-width flex columns (backward-compatible, no grid-template-columns)', () => {
    const { container } = render(<FooterRenderer data={DATA} />);
    const row = container.querySelector('.flex.flex-wrap.gap-8');
    expect(row).toBeTruthy();
    expect(row.style.gridTemplateColumns).toBe('');
  });

  it('"balanced" applies a 1.5fr : 2fr : ...1fr grid ratio instead of equal flex columns', () => {
    const { container } = render(<FooterRenderer data={{ ...DATA, column_ratio: 'balanced', social_heading: 'Follow Us', social_links: [{ id: 's1', platform: 'x', url: '#' }] }} />);
    const row = container.querySelector('[style*="grid-template-columns"]');
    expect(row).toBeTruthy();
    expect(row.style.gridTemplateColumns).toContain('1.5fr');
    expect(row.style.gridTemplateColumns.trim().endsWith('1fr')).toBe(true);
  });

  it('has no effect when there are no link_columns', () => {
    const { container } = render(<FooterRenderer data={{ column_ratio: 'balanced', tagline: 'Hello' }} />);
    expect(container.querySelector('[style*="grid-template-columns"]')).toBeNull();
  });
});

describe('FooterRenderer — link_columns[].links_layout', () => {
  const EIGHT_LINKS = Array.from({ length: 8 }, (_, i) => ({ id: `l${i}`, label: `Link ${i}`, url: `/l${i}` }));

  it('"list" (default) renders a single <ul>', () => {
    const { container } = render(<FooterRenderer data={{ link_columns: [{ id: 'c1', heading: 'Category', links: EIGHT_LINKS }] }} />);
    expect(container.querySelectorAll('ul')).toHaveLength(1);
    expect(container.querySelectorAll('ul li')).toHaveLength(8);
  });

  it('isMobile forces a single stacked column, overriding column_ratio (Canvas.jsx simulates device width — real CSS breakpoints do not track it)', () => {
    const { container } = render(
      <FooterRenderer data={{ link_columns: [{ id: 'c1', heading: 'Category', links: EIGHT_LINKS }], column_ratio: 'balanced' }} isMobile />
    );
    const row = container.querySelector('.mb-6');
    expect(row.className).toContain('flex-col');
    expect(row.style.gridTemplateColumns).toBe('');
  });

  it('"2-column" splits links into two top-to-bottom groups (not row-interleaved)', () => {
    const { container } = render(
      <FooterRenderer data={{ link_columns: [{ id: 'c1', heading: 'Category', links_layout: '2-column', links: EIGHT_LINKS }] }} />
    );
    const lists = container.querySelectorAll('ul');
    expect(lists).toHaveLength(2);
    expect(lists[0].textContent).toBe('Link 0Link 1Link 2Link 3');
    expect(lists[1].textContent).toBe('Link 4Link 5Link 6Link 7');
  });
});

describe('FooterRenderer — logo rendering', () => {
  it('image-only (no logo_text): renders at 42px height with aspect ratio preserved, no duplicate text', () => {
    const { container, queryByText } = render(
      <FooterRenderer data={{ logo_image: LOGO_IMAGE_REF }} mediaLibrary={MEDIA_LIBRARY} />
    );
    const img = container.querySelector('img');
    expect(img.className).toContain('h-[42px]');
    expect(img.className).toContain('w-auto');
    expect(img.className).not.toContain('h-6 w-6');
    expect(queryByText('Houzez')).toBeNull();
  });

  it('image + logo_text (Xinear-style): keeps the original small icon + separate text label unchanged', () => {
    const { container, getByText } = render(
      <FooterRenderer data={{ logo_image: LOGO_IMAGE_REF, logo_text: 'Xinear' }} mediaLibrary={MEDIA_LIBRARY} />
    );
    const img = container.querySelector('img');
    expect(img.className).toContain('h-6 w-6');
    expect(getByText('Xinear')).toBeTruthy();
  });
});

describe('FooterRenderer — structured address width/typography (Houzez)', () => {
  it('caps the address block at 300px with 13px/1.6-line-height type, unlike the plain tagline branch', () => {
    const { container } = render(
      <FooterRenderer
        data={{
          link_columns: [{ id: 'c1', heading: 'Category', links: [{ id: 'l1', label: 'A', url: '/a' }] }],
          address_heading: 'Tangerang',
          address_body: 'Some long address that should wrap at a fixed width instead of the full column width',
        }}
      />
    );
    const addressBlock = container.querySelector('.max-w-\\[300px\\]');
    expect(addressBlock).toBeTruthy();
    expect(addressBlock.className).toContain('text-[13px]');
    expect(addressBlock.className).toContain('leading-[1.6]');
  });
});

describe('FooterRenderer — show_copyright + copyright_text', () => {
  it('renders the exact configured copyright text below a divider when show_copyright is true', () => {
    const { getByText } = render(
      <FooterRenderer data={{ ...DATA, show_copyright: true, copyright_text: '©2024 PT Houzez. All rights reserved.', show_border: true }} />
    );
    expect(getByText('©2024 PT Houzez. All rights reserved.')).toBeTruthy();
  });

  it('omits the copyright row when show_copyright is false', () => {
    const { queryByText } = render(
      <FooterRenderer data={{ ...DATA, show_copyright: false, copyright_text: '©2024 PT Houzez. All rights reserved.' }} />
    );
    expect(queryByText('©2024 PT Houzez. All rights reserved.')).toBeNull();
  });
});
