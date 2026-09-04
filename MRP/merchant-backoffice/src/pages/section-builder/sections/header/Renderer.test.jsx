import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import HeaderRenderer from './Renderer';

const NAV_LINKS = [
  { id: 'nav-home', label: 'Home', url: '/' },
  { id: 'nav-about', label: 'About', url: '/about' },
];

describe('HeaderRenderer — nav visibility vs. the builder viewport toggle', () => {
  // isMobile is the builder's simulated Desktop/Mobile toggle (a fixed-width
  // div, not a real narrower browser window). Nav visibility must not depend
  // on a `sm:` media query against the actual (possibly narrower or wider,
  // zoomed, etc.) host window — there's no mobile hamburger menu yet, so nav
  // should stay visible everywhere except the explicit Mobile toggle.
  it('shows nav links when isMobile is explicitly false (builder desktop toggle)', () => {
    const { container } = render(<HeaderRenderer data={{ nav_links: NAV_LINKS }} isMobile={false} />);
    const nav = container.querySelector('nav');
    expect(nav.className).not.toContain('hidden');
    expect(nav.textContent).toContain('Home');
    expect(nav.textContent).toContain('About');
  });

  it('hides nav links when isMobile is explicitly true (builder mobile toggle)', () => {
    const { container } = render(<HeaderRenderer data={{ nav_links: NAV_LINKS }} isMobile />);
    const nav = container.querySelector('nav');
    expect(nav.className).toBe('hidden');
  });

  it('shows nav links when isMobile is not passed at all (real storefront/live preview)', () => {
    const { container } = render(<HeaderRenderer data={{ nav_links: NAV_LINKS }} />);
    const nav = container.querySelector('nav');
    expect(nav.className).not.toContain('hidden');
    expect(nav.textContent).toContain('Home');
    expect(nav.textContent).toContain('About');
  });
});

describe('HeaderRenderer — nav link clicking', () => {
  it('renders links as plain text (no onNavigate) inside the interactive builder, so clicks bubble to select the header', () => {
    const { container } = render(<HeaderRenderer data={{ nav_links: NAV_LINKS }} isMobile={false} />);
    expect(container.querySelectorAll('nav a')).toHaveLength(0);
    expect(container.querySelectorAll('nav span')).toHaveLength(2);
  });

  it('renders links as clickable anchors and calls onNavigate with the link URL, without a real page navigation', () => {
    const onNavigate = vi.fn();
    const { getByText } = render(<HeaderRenderer data={{ nav_links: NAV_LINKS }} onNavigate={onNavigate} />);
    const aboutLink = getByText('About');
    expect(aboutLink.tagName).toBe('A');
    const event = fireEvent.click(aboutLink);
    expect(onNavigate).toHaveBeenCalledWith('/about');
    // fireEvent.click returns false when preventDefault() was called.
    expect(event).toBe(false);
  });
});

describe('HeaderRenderer — layout_variant', () => {
  it('defaults to the inline layout when layout_variant is absent (backward compatible)', () => {
    const { container } = render(<HeaderRenderer data={{ nav_links: NAV_LINKS, logo_text: 'Acme' }} />);
    expect(container.querySelector('header').className).toContain('justify-between');
    expect(container.querySelectorAll('nav')).toHaveLength(1);
  });

  it('centered-split splits nav links across two <nav>s flanking the logo, all links still present', () => {
    const { container, getByText } = render(
      <HeaderRenderer data={{ nav_links: NAV_LINKS, logo_text: 'Acme', layout_variant: 'centered-split' }} />
    );
    expect(container.querySelectorAll('nav')).toHaveLength(2);
    expect(getByText('Acme')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
  });

  it('stacked-bold renders a single nav bar plus a separate bold logo row', () => {
    const { container, getByText } = render(
      <HeaderRenderer data={{ nav_links: NAV_LINKS, logo_text: 'Acme', layout_variant: 'stacked-bold' }} />
    );
    expect(container.querySelectorAll('nav')).toHaveLength(1);
    const logo = getByText('Acme');
    expect(logo.className).toContain('uppercase');
  });

  it('hides nav in every variant when isMobile is true', () => {
    for (const layout_variant of ['inline', 'centered-split', 'stacked-bold']) {
      const { container, unmount } = render(
        <HeaderRenderer data={{ nav_links: NAV_LINKS, layout_variant }} isMobile />
      );
      container.querySelectorAll('nav').forEach((nav) => expect(nav.className).toBe('hidden'));
      unmount();
    }
  });
});
