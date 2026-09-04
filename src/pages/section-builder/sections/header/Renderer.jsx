import { memo, useState } from 'react';
import { Search, ShoppingBag, Globe, ChevronDown, MoreHorizontal, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';

/**
 * US-11.A1 — renders identically on every page (header/footer are global,
 * see builderReducer.js). Branches on `data.layout_variant` (schema.js) so
 * each site template can pick a structurally distinct header identity
 * without any new data model beyond that one field — `inline` reproduces
 * the original single layout exactly, so existing drafts/tests without the
 * field are unaffected.
 */
function HeaderRenderer({ data, isMobile, onNavigate, theme, mediaLibrary, currentPath }) {
  const { t } = useTranslation();
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = data.nav_links ?? [
    { id: 'a', label: t('sectionBuilder:sections.header.defaultNavShop'), url: '/collections/all' },
    { id: 'b', label: t('sectionBuilder:sections.header.defaultNavAbout'), url: '/about' },
  ];
  const logoText = data.logo_text || t('sectionBuilder:sections.header.defaultStoreName');
  const logoImage = resolveMedia(data.logo_image, mediaLibrary);
  const variant = data.layout_variant || 'inline';
  const overflowAfter = data.nav_overflow_after ?? 5;
  const languages = data.languages?.length ? data.languages : [{ id: 'lang-en', code: 'EN', label: 'English' }];
  const activeLanguage = languages[0];

  // Nav links stay visible on mobile too now (via the hamburger panel
  // below) — only the inline desktop nav row hides on mobile.
  const navClass = (base) => (isMobile ? 'hidden' : base);

  function renderLink(link, linkClassName, onClick) {
    // Active-state comparison: `currentPath` is optional and undefined by
    // default (only threaded through by PreviewLive.jsx and
    // SectionBuilder.jsx's own live canvas today — see Canvas.jsx). When
    // it's undefined, `isActive` is `null` and we fall through to the
    // original uniform class untouched, so any call site that hasn't been
    // updated to pass `currentPath` renders byte-identical to before.
    const isActive = currentPath != null ? link.url === currentPath : null;
    const className = isActive === true ? linkClassName + ' font-bold opacity-100' : linkClassName;
    // Only clickable on the read-only preview/live render (onNavigate is
    // only passed there, see Canvas.jsx's GlobalBlock) — inside the
    // interactive builder these stay plain text so clicking selects the
    // header instead of jumping the merchant to another page.
    return onNavigate ? (
      <a
        key={link.id ?? link.label}
        href={link.url || '#'}
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
          onNavigate(link.url);
        }}
        className={className + ' hover:underline'}
      >
        {link.label || t('sectionBuilder:sections.common.link')}
      </a>
    ) : (
      <span key={link.id ?? link.label} className={className}>
        {link.label || t('sectionBuilder:sections.common.link')}
      </span>
    );
  }

  // Collapses links beyond `overflowAfter` into a "⋯" dropdown so a long
  // nav_links list never wraps/overflows the row.
  function renderNavLinks(itemClassName) {
    if (links.length <= overflowAfter) return links.map((l) => renderLink(l, itemClassName));
    const visible = links.slice(0, overflowAfter);
    const overflow = links.slice(overflowAfter);
    return [
      ...visible.map((l) => renderLink(l, itemClassName)),
      <div key="overflow" className="relative">
        <button
          type="button"
          onClick={() => setOverflowOpen((v) => !v)}
          className={itemClassName + ' flex items-center'}
          aria-label={t('sectionBuilder:sections.header.moreLinks', 'More')}
        >
          <MoreHorizontal size={18} aria-hidden />
        </button>
        {overflowOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 min-w-[10rem] rounded-xl border border-gray-100 bg-white p-2 text-gray-900 shadow-lg">
            {overflow.map((l) => renderLink(l, 'block rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50', () => setOverflowOpen(false)))}
          </div>
        )}
      </div>,
    ];
  }

  function renderLogo(baseClassName) {
    // When no logo_image is set, keep the exact original single-span
    // markup (no wrapper, no extra classes) so every existing header
    // without this field renders byte-identical to before.
    if (!logoImage) {
      return <span className={baseClassName}>{logoText}</span>;
    }
    return (
      <span className={'inline-flex items-center gap-2 ' + baseClassName}>
        <img src={logoImage.url} alt="" aria-hidden className="h-6 w-6" />
        <span>{logoText}</span>
      </span>
    );
  }

  function renderLanguageSwitcher() {
    // The pill + dropdown are real, clickable UI — but purely visual: no
    // real i18n/locale mechanism is wired up here (this app's actual
    // language switching, if any, lives entirely elsewhere). "Selecting" a
    // language below only closes the dropdown, it does not change anything.
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-1 rounded-full border border-current/20 px-2 py-1 text-xs"
        >
          <Globe size={14} aria-hidden />
          <span>{activeLanguage.code}</span>
          <ChevronDown size={12} aria-hidden className={langOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        {langOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 min-w-[9rem] rounded-xl border border-gray-100 bg-white p-1.5 text-gray-900 shadow-lg">
            {languages.map((lang) => (
              <button
                key={lang.id ?? lang.code}
                type="button"
                onClick={() => setLangOpen(false)}
                className={
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs ' +
                  (lang.code === activeLanguage.code ? 'bg-green-50 font-semibold' : 'hover:bg-gray-50')
                }
              >
                <span>{lang.label || lang.code}</span>
                <span className="text-gray-400">{lang.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderIcons() {
    return (
      <div className="flex items-center gap-3">
        {data.show_search_icon !== false && <Search size={18} aria-hidden />}
        {data.show_cart_icon !== false && <ShoppingBag size={18} aria-hidden />}
        {data.show_language_switcher && !isMobile && renderLanguageSwitcher()}
        {isMobile && (
          <button type="button" onClick={() => setMobileOpen((v) => !v)} aria-label={t('sectionBuilder:sections.header.menu', 'Menu')}>
            {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        )}
      </div>
    );
  }

  function renderMobilePanel() {
    if (!isMobile || !mobileOpen) return null;
    return (
      <div className="absolute inset-x-0 top-full z-30 flex flex-col gap-1 border-t border-gray-100 bg-white px-6 py-4 text-gray-900 shadow-lg">
        {links.map((l) => renderLink(l, 'block rounded-lg px-2 py-2.5 text-sm', () => setMobileOpen(false)))}
        {data.show_language_switcher && (
          <>
            <hr className="my-2 border-gray-100" />
            <div className="flex flex-wrap gap-2 px-2">
              {languages.map((lang) => (
                <span
                  key={lang.id ?? lang.code}
                  className={'rounded-full border px-2.5 py-1 text-xs ' + (lang.code === activeLanguage.code ? 'border-green-600 font-semibold text-green-700' : 'border-gray-200 text-gray-600')}
                >
                  {lang.code}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  const borderStyle = data.show_border
    ? { borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme?.colors?.border || undefined }
    : undefined;
  const borderClass = data.show_border && !theme?.colors?.border ? 'border-b border-gray-200' : '';
  const withBorder = (base) => (borderClass ? base + ' ' + borderClass : base);

  let headerContent;

  if (variant === 'centered-nav') {
    // Logo/icons columns size to their own content (`auto`); the nav column
    // takes the rest (`1fr`) — a plain `grid-cols-3` would instead force all
    // three into equal thirds, squeezing the nav into a column far narrower
    // than the logo/icon columns actually need and wrapping multi-word
    // labels even though the row has visible spare width either side.
    headerContent = (
      <header className={withBorder('grid grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4')} style={borderStyle}>
        <div className="flex items-center justify-start">{renderLogo('text-lg font-semibold')}</div>
        <nav className={navClass('flex items-center justify-center gap-5 text-sm whitespace-nowrap')}>
          {renderNavLinks('')}
        </nav>
        <div className="flex items-center justify-end">{renderIcons()}</div>
      </header>
    );
  } else if (variant === 'centered-split') {
    // Nav links split into two groups flanking a centered logo — a clean,
    // symmetric layout (fits Manufacture's corporate/B2B feel). Overflow
    // collapsing is skipped here (links are already split into two short
    // groups, not one long row).
    const half = Math.ceil(links.length / 2);
    const leftLinks = links.slice(0, half);
    const rightLinks = links.slice(half);
    headerContent = (
      <header className={withBorder('grid grid-cols-3 items-center px-6 py-4')} style={borderStyle}>
        <nav className={navClass('flex gap-5 text-sm')}>{leftLinks.map((l) => renderLink(l, ''))}</nav>
        {renderLogo('text-center text-lg font-semibold')}
        <div className="flex items-center justify-end gap-5">
          <nav className={navClass('flex gap-5 text-sm')}>{rightLinks.map((l) => renderLink(l, ''))}</nav>
          {renderIcons()}
        </div>
      </header>
    );
  } else if (variant === 'stacked-bold') {
    // Two-row header: a slim small-caps nav bar on top, then a large bold
    // uppercase logo row beneath — an energetic, layered identity.
    headerContent = (
      <header className={borderClass || undefined} style={borderStyle}>
        <div className="flex items-center justify-between border-b border-current/10 px-6 py-2">
          <nav className={navClass('flex gap-4 text-[11px] uppercase tracking-wide')}>
            {renderNavLinks('')}
          </nav>
          {renderIcons()}
        </div>
        <div className="px-6 py-3">{renderLogo('text-2xl font-extrabold uppercase tracking-tight')}</div>
      </header>
    );
  } else {
    // 'inline' (default) — logo left, nav inline, icons right. Original layout.
    headerContent = (
      <header className={withBorder('flex items-center justify-between px-6 py-4')} style={borderStyle}>
        {renderLogo('text-lg font-semibold')}
        <nav className={navClass('flex gap-5 text-sm')}>{renderNavLinks('')}</nav>
        {renderIcons()}
      </header>
    );
  }

  return (
    <div className="relative">
      {headerContent}
      {renderMobilePanel()}
    </div>
  );
}

export default memo(HeaderRenderer);
