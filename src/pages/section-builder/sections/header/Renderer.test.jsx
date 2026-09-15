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
    const { container } = render(<HeaderRenderer data={{}} menus={{ 'main-menu': { items: NAV_LINKS } }} isMobile={false} />);
    const nav = container.querySelector('nav');
    expect(nav.className).not.toContain('hidden');
    expect(nav.textContent).toContain('Home');
    expect(nav.textContent).toContain('About');
  });

  it('hides nav links when isMobile is explicitly true (builder mobile toggle)', () => {
    const { container } = render(<HeaderRenderer data={{}} menus={{ 'main-menu': { items: NAV_LINKS } }} isMobile />);
    const nav = container.querySelector('nav');
    expect(nav.className).toBe('hidden');
  });

  it('shows nav links when isMobile is not passed at all (real storefront/live preview)', () => {
    const { container } = render(<HeaderRenderer data={{}} menus={{ 'main-menu': { items: NAV_LINKS } }} />);
    const nav = container.querySelector('nav');
    expect(nav.className).not.toContain('hidden');
    expect(nav.textContent).toContain('Home');
    expect(nav.textContent).toContain('About');
  });
});

describe('HeaderRenderer — nav link clicking', () => {
  it('renders links as plain text (no onNavigate) inside the interactive builder, so clicks bubble to select the header', () => {
    const { container } = render(<HeaderRenderer data={{}} menus={{ 'main-menu': { items: NAV_LINKS } }} isMobile={false} />);
    expect(container.querySelectorAll('nav a')).toHaveLength(0);
    expect(container.querySelectorAll('nav span')).toHaveLength(2);
  });

  it('renders links as clickable anchors and calls onNavigate with the link URL, without a real page navigation', () => {
    const onNavigate = vi.fn();
    const { getByText } = render(<HeaderRenderer data={{}} menus={{ 'main-menu': { items: NAV_LINKS } }} onNavigate={onNavigate} />);
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
    const { container } = render(<HeaderRenderer data={{ logo_text: 'Acme' }} menus={{ 'main-menu': { items: NAV_LINKS } }} />);
    expect(container.querySelector('header').className).toContain('justify-between');
    expect(container.querySelectorAll('nav')).toHaveLength(1);
  });

  it('centered-split splits nav links across two <nav>s flanking the logo, all links still present', () => {
    const { container, getByText } = render(
      <HeaderRenderer data={{ logo_text: 'Acme', layout_variant: 'centered-split' }} menus={{ 'main-menu': { items: NAV_LINKS } }} />
    );
    expect(container.querySelectorAll('nav')).toHaveLength(2);
    expect(getByText('Acme')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
  });

  it('stacked-bold renders a single nav bar plus a separate bold logo row', () => {
    const { container, getByText } = render(
      <HeaderRenderer data={{ logo_text: 'Acme', layout_variant: 'stacked-bold' }} menus={{ 'main-menu': { items: NAV_LINKS } }} />
    );
    expect(container.querySelectorAll('nav')).toHaveLength(1);
    const logo = getByText('Acme');
    expect(logo.className).toContain('uppercase');
  });

  it('hides nav in every variant when isMobile is true', () => {
    for (const layout_variant of ['inline', 'centered-split', 'stacked-bold']) {
      const { container, unmount } = render(
        <HeaderRenderer data={{ layout_variant }} menus={{ 'main-menu': { items: NAV_LINKS } }} isMobile />
      );
      container.querySelectorAll('nav').forEach((nav) => expect(nav.className).toBe('hidden'));
      unmount();
    }
  });
});

describe('HeaderRenderer — nav_color', () => {
  const THEME = { colors: { primary: '#16894b', accent: '#0000ff', text_primary: '#1b1916' } };

  it('defaults to no color override (backward compatible — inherits the section text color)', () => {
    const { getByText } = render(<HeaderRenderer data={{}} menus={{ 'main-menu': { items: NAV_LINKS } }} theme={THEME} />);
    expect(getByText('Home').style.color).toBe('');
  });

  it('"primary" colors nav links with theme.colors.primary', () => {
    const { getByText } = render(<HeaderRenderer data={{ nav_color: 'primary' }} menus={{ 'main-menu': { items: NAV_LINKS } }} theme={THEME} />);
    expect(getByText('Home').style.color).toBe('rgb(22, 137, 75)');
    expect(getByText('About').style.color).toBe('rgb(22, 137, 75)');
  });

  it('"accent" colors nav links with theme.colors.accent', () => {
    const { getByText } = render(<HeaderRenderer data={{ nav_color: 'accent' }} menus={{ 'main-menu': { items: NAV_LINKS } }} theme={THEME} />);
    expect(getByText('Home').style.color).toBe('rgb(0, 0, 255)');
  });
});

describe('HeaderRenderer — logo rendering', () => {
  const MEDIA_LIBRARY = [{ id: 'media-logo', url: '/logo.png' }];
  const LOGO_IMAGE_REF = { mediaId: 'media-logo' };

  it('image-only (logo_text explicitly empty): renders at 42px height with no duplicate text label', () => {
    const { container, queryByText } = render(
      <HeaderRenderer data={{ logo_image: LOGO_IMAGE_REF, logo_text: '' }} mediaLibrary={MEDIA_LIBRARY} />
    );
    const img = container.querySelector('img[alt]');
    expect(img.className).toBe('h-[42px] w-auto object-contain');
    // Only the schema's non-empty default ('My Store') would show up here —
    // confirms it does not leak through when logo_text is explicitly ''.
    expect(queryByText('My Store')).toBeNull();
  });

  it('image + logo_text (existing convention): keeps the small icon + separate text label unchanged', () => {
    const { container, getByText } = render(
      <HeaderRenderer data={{ logo_image: LOGO_IMAGE_REF, logo_text: 'Acme' }} mediaLibrary={MEDIA_LIBRARY} />
    );
    const img = container.querySelector('img');
    expect(img.className).toBe('h-6 w-6');
    expect(getByText('Acme')).toBeTruthy();
  });
});

describe('HeaderRenderer — language switcher flag', () => {
  it('falls back to a globe icon when a language has no `flag` (backward compatible)', () => {
    const { container } = render(
      <HeaderRenderer data={{ show_language_switcher: true, languages: [{ id: 'l1', code: 'EN', label: 'English' }] }} />
    );
    expect(container.querySelector('img[alt=""]')).toBeNull();
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders a real flag image (flagcdn) when a language sets `flag`', () => {
    const { container } = render(
      <HeaderRenderer data={{ show_language_switcher: true, languages: [{ id: 'l1', code: 'EN', label: 'English', flag: 'us' }] }} />
    );
    const flagImg = container.querySelector('img[src*="flagcdn.com"]');
    expect(flagImg).toBeTruthy();
    expect(flagImg.src).toContain('/us.png');
  });
});
