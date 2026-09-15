import { memo, useState } from 'react';
import { Search, ShoppingBag, Globe, ChevronDown, MoreHorizontal, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import { resolveNavRecipe } from '../shared/navRecipes';
import { resolveSectionScheme } from '../shared/sectionChrome';
import { useStorefrontCart } from '../shared/storefrontCartContext';

/**
 * US-11.A1 — renders identically on every page (header/footer are global,
 * see builderReducer.js). Branches on `data.layout_variant` (schema.js) so
 * each site template can pick a structurally distinct header identity
 * without any new data model beyond that one field — `inline` reproduces
 * the original single layout exactly, so existing drafts/tests without the
 * field are unaffected.
 */
function HeaderRenderer({ data, isMobile, onNavigate, theme, mediaLibrary, currentPath, menus }) {
  const { t } = useTranslation();
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which top-level nav item's submenu dropdown (desktop) is open — at most
  // one at a time, closed by clicking elsewhere via the same pattern as
  // overflowOpen/langOpen above.
  const [openSubmenuId, setOpenSubmenuId] = useState(null);
  // Which top-level nav item's children are expanded in the mobile panel —
  // a Set (not a single id) since, unlike the desktop dropdown, more than
  // one section can be open at once in an accordion.
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState(() => new Set());
  // Reads a safe no-op (count: 0) when no StorefrontCartProvider is mounted
  // above this header (the interactive builder canvas) — see
  // storefrontCart.js — so the badge just never appears there.
  const { count: cartCount } = useStorefrontCart();
  // Content > Menus (US-Content.1) — nav items live in the shared
  // `state.menus`, keyed by whichever menu this header's `nav_menu_ref`
  // field currently points at (see schema.js's `nav_menu_ref` and
  // builderReducer.js) — defaults to 'main-menu' for old data that
  // predates the field, or a section whose `data.nav_menu_ref` was never
  // set. `menus` being absent entirely (an old call site that hasn't
  // threaded it through yet, or a draft mid-migration) falls back to the
  // same two-link placeholder this Renderer has always shown when there
  // was no real nav data yet.
  const navMenuId = data.nav_menu_ref?.menuId ?? 'main-menu';
  const links = menus?.[navMenuId]?.items ?? [
    { id: 'a', label: t('sectionBuilder:sections.header.defaultNavShop'), url: '/collections/all' },
    { id: 'b', label: t('sectionBuilder:sections.header.defaultNavAbout'), url: '/about' },
  ];
  const logoText = data.logo_text || t('sectionBuilder:sections.header.defaultStoreName');
  const logoImage = resolveMedia(data.logo_image, mediaLibrary);
  const variant = data.layout_variant || 'inline';
  const overflowAfter = data.nav_overflow_after ?? 5;
  const languages = data.languages?.length ? data.languages : [{ id: 'lang-en', code: 'EN', label: 'English' }];
  const activeLanguage = languages[0];
  // See schema.js — only applied to the main inline nav row, not the
  // overflow dropdown (which already has its own active/hover treatment).
  const navColor = data.nav_color === 'primary' ? theme?.colors?.primary : data.nav_color === 'accent' ? theme?.colors?.accent : undefined;
  // Internal theme recipe (navRecipes.js), not a merchant-facing field — see
  // that module's header comment. DEFAULT_NAV_RECIPE reproduces today's
  // 400-inactive/700-active exactly, so this is a no-op for every header
  // without an explicit `theme.navRecipe` (only Houzez sets one).
  const navRecipe = resolveNavRecipe(theme);
  const navLinkRecipe = { color: navColor, fontWeight: navRecipe.fontWeight, activeFontWeight: navRecipe.activeFontWeight, letterSpacing: navRecipe.letterSpacing };

  // Nav links stay visible on mobile too now (via the hamburger panel
  // below) — only the inline desktop nav row hides on mobile.
  const navClass = (base) => (isMobile ? 'hidden' : base);

  function renderLink(link, linkClassName, onClick, navLinkRecipeOverride) {
    // Active-state comparison: `currentPath` is optional and undefined by
    // default (only threaded through by PreviewLive.jsx and
    // SectionBuilder.jsx's own live canvas today — see Canvas.jsx). When
    // it's undefined, `isActive` is `null` and we fall through to the
    // original uniform class untouched, so any call site that hasn't been
    // updated to pass `currentPath` renders byte-identical to before.
    const isActive = currentPath != null ? link.url === currentPath : null;
    const className = isActive === true ? linkClassName + ' font-bold opacity-100' : linkClassName;
    // `font-bold` above already covers the Tailwind-default 700 active
    // weight; the recipe's `fontWeight`/`activeFontWeight` inline style only
    // matters when it differs from that (i.e. Houzez's 500 inactive) — for
    // the default recipe this resolves to 400/700, identical to what the
    // untouched className already renders, so it's a no-op there.
    const style = navLinkRecipeOverride
      ? {
          color: navLinkRecipeOverride.color,
          fontWeight: isActive === true ? navLinkRecipeOverride.activeFontWeight : navLinkRecipeOverride.fontWeight,
          letterSpacing: navLinkRecipeOverride.letterSpacing,
        }
      : undefined;
    // Only clickable on the read-only preview/live render (onNavigate is
    // only passed there, see Canvas.jsx's GlobalBlock) — inside the
    // interactive builder these stay plain text so clicking selects the
    // header instead of jumping the merchant to another page.
    const children = link.children ?? [];
    if (children.length > 0) {
      // Submenu item (Content > Menus, one level deep — see
      // MenusManagement.jsx) — a hover/click dropdown on desktop, matching
      // the existing overflow "⋯" dropdown's own look, rather than a plain
      // link/span.
      const isOpen = openSubmenuId === link.id;
      return (
        <div
          key={link.id ?? link.label}
          className="relative"
          onMouseEnter={() => setOpenSubmenuId(link.id)}
          onMouseLeave={() => setOpenSubmenuId((current) => (current === link.id ? null : current))}
        >
          <button
            type="button"
            onClick={() => setOpenSubmenuId((current) => (current === link.id ? null : link.id))}
            className={className + ' inline-flex items-center gap-1'}
            style={style}
          >
            {link.label || t('sectionBuilder:sections.common.link')}
            <ChevronDown size={14} aria-hidden className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {isOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 min-w-[10rem] rounded-xl border border-gray-100 bg-white p-2 text-gray-900 shadow-lg">
              {children.map((child) =>
                renderLink(child, 'block rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50', () => {
                  onClick?.();
                  setOpenSubmenuId(null);
                })
              )}
            </div>
          )}
        </div>
      );
    }
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
        style={style}
      >
        {link.label || t('sectionBuilder:sections.common.link')}
      </a>
    ) : (
      <span key={link.id ?? link.label} className={className} style={style}>
        {link.label || t('sectionBuilder:sections.common.link')}
      </span>
    );
  }

  // Collapses links beyond `overflowAfter` into a "⋯" dropdown so a long
  // nav_links list never wraps/overflows the row. `navLinkRecipe` (schema's
  // nav_color) only applies to this main visible row — the overflow
  // dropdown keeps its own distinct active/hover treatment below.
  function renderNavLinks(itemClassName) {
    if (links.length <= overflowAfter) return links.map((l) => renderLink(l, itemClassName, undefined, navLinkRecipe));
    const visible = links.slice(0, overflowAfter);
    const overflow = links.slice(overflowAfter);
    return [
      ...visible.map((l) => renderLink(l, itemClassName, undefined, navLinkRecipe)),
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

  // Same "icon+text" vs. "image-only full lockup" distinction as
  // footer/Renderer.jsx's renderLogoRow — see that module's comment. Only
  // reachable here when `logo_text` is absent (Houzez leaves it unset
  // because houzez-logo.png already bakes the wordmark in); every existing
  // header that sets both `logo_image` and `logo_text` keeps the small-icon
  // + separate-text layout unchanged.
  function renderLogo(baseClassName) {
    // When no logo_image is set, keep the exact original single-span
    // markup (no wrapper, no extra classes) so every existing header
    // without this field renders byte-identical to before.
    if (!logoImage) {
      return <span className={baseClassName}>{logoText}</span>;
    }
    if (!data.logo_text) {
      return <img src={logoImage.url} alt={t('sectionBuilder:sections.header.defaultStoreName', logoText)} className="h-[42px] w-auto object-contain" />;
    }
    return (
      <span className={'inline-flex items-center gap-2 ' + baseClassName}>
        <img src={logoImage.url} alt="" aria-hidden className="h-6 w-6" />
        <span>{logoText}</span>
      </span>
    );
  }

  // Real flag image (flagcdn.com, same source the golden reference uses)
  // when a language entry sets `flag` (schema.js); falls back to the
  // lucide Globe icon otherwise, so existing `languages` data without the
  // new field renders exactly as before.
  function renderFlag(lang) {
    if (!lang.flag) return <Globe size={14} aria-hidden />;
    return <img src={`https://flagcdn.com/w40/${lang.flag.toLowerCase()}.png`} alt="" aria-hidden className="h-3.5 w-5 rounded-sm object-cover" />;
  }

  function renderLanguageSwitcher() {
    // The pill + dropdown are real, clickable UI — but purely visual: no
    // real i18n/locale mechanism is wired up here (this app's actual
    // language switching, if any, lives entirely elsewhere). "Selecting" a
    // language below only closes the dropdown, it does not change anything.
    // Radius reads the theme's own buttons.corner_radius token: a theme
    // that explicitly opts into sharp corners everywhere (0 — e.g. Xinear)
    // gets a square trigger; every other theme gets the golden Houzez
    // reference's own 8px radius (get_design_context on node 81:74378 —
    // NOT a full pill, despite this trigger's previous hardcoded
    // `rounded-full`).
    const radius = theme?.buttons?.corner_radius === 0 ? '0px' : '8px';
    const borderColor = theme?.colors?.border;
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangOpen((v) => !v)}
          className={`flex items-center gap-2 border p-2 text-sm font-bold ${borderColor ? '' : 'border-gray-200'}`}
          style={{ borderRadius: radius, borderColor }}
        >
          {renderFlag(activeLanguage)}
          <span>{activeLanguage.code}</span>
          <ChevronDown size={16} aria-hidden className={langOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        {langOpen && (
          <div
            className="absolute right-0 top-full z-20 mt-2 min-w-[9rem] border border-gray-100 bg-white p-1.5 text-gray-900 shadow-lg"
            style={{ borderRadius: theme?.buttons?.corner_radius === 0 ? '0px' : '0.75rem' }}
          >
            {languages.map((lang) => (
              <button
                key={lang.id ?? lang.code}
                type="button"
                onClick={() => setLangOpen(false)}
                className={
                  `flex w-full items-center gap-2 px-3 py-2 text-left text-xs ${theme?.buttons?.corner_radius === 0 ? '' : 'rounded-lg'} ` +
                  (lang.code === activeLanguage.code ? 'bg-green-50 font-semibold' : 'hover:bg-gray-50')
                }
              >
                {renderFlag(lang)}
                <span>{lang.label || lang.code}</span>
                <span className="ml-auto text-gray-400">{lang.code}</span>
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
        {data.show_cart_icon !== false && (
          <span className="relative inline-flex">
            <ShoppingBag size={18} aria-hidden />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                {cartCount}
              </span>
            )}
          </span>
        )}
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
        {links.map((l) => {
          const children = l.children ?? [];
          if (children.length === 0) {
            return renderLink(l, 'block rounded-lg px-2 py-2.5 text-sm', () => setMobileOpen(false));
          }
          // Accordion row — tapping the label toggles its children open/
          // closed instead of navigating, same "own section, independent of
          // the others" model as renderLanguageSwitcher's dropdown.
          const isExpanded = openMobileSubmenus.has(l.id);
          return (
            <div key={l.id ?? l.label}>
              <button
                type="button"
                onClick={() =>
                  setOpenMobileSubmenus((prev) => {
                    const next = new Set(prev);
                    if (next.has(l.id)) next.delete(l.id);
                    else next.add(l.id);
                    return next;
                  })
                }
                className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left text-sm"
              >
                <span>{l.label || t('sectionBuilder:sections.common.link')}</span>
                <ChevronDown size={14} aria-hidden className={isExpanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              {isExpanded && (
                <div className="flex flex-col gap-1 pl-4">
                  {children.map((child) => renderLink(child, 'block rounded-lg px-2 py-2 text-sm', () => setMobileOpen(false)))}
                </div>
              )}
            </div>
          );
        })}
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

  // `sticky` (schema.js, default true) previously had no effect at all —
  // wiring it in here is a bug fix, not a new behavior: a schema field that
  // silently does nothing regardless of its value isn't "existing generic
  // behavior" worth preserving. Position: fixed/sticky headers are already
  // this field's own documented default for every theme.
  // zIndex: 50, not some higher arbitrary value — ThemePreview.jsx's own
  // builder-chrome toolbar is `sticky z-[60]` specifically documented as
  // needing to "beat the highest z-index used anywhere in a section"; a
  // header z-index at or above that overlaps/paints over the builder's own
  // toolbar while scrolling instead of staying tucked beneath it.
  const stickyStyle = data.sticky !== false ? { position: 'sticky', top: 0, zIndex: 50 } : undefined;
  // `color_scheme` (schema.js's SECTION_CHROME_FIELDS field, default
  // 'background') was previously defined but never actually applied to a
  // background/text color here — every header rendered with the browser's
  // transparent/inherited default regardless of the field's value, which
  // happened to look right for themes whose intended scheme is a plain
  // white page background (Houzez/Xinear), but is wrong for a theme like
  // Barger whose Figma header is a solid dark bar (color_scheme:
  // 'background' resolving to a dark `background` token). Same resolver
  // regular page sections already use (see ui/SectionShell.jsx).
  const scheme = resolveSectionScheme(data.color_scheme, theme?.colors);
  const borderStyle = {
    ...(scheme.background ? { backgroundColor: scheme.background } : {}),
    ...(scheme.text ? { color: scheme.text } : {}),
    ...(data.show_border ? { borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme?.colors?.border || undefined } : {}),
    ...stickyStyle,
  };
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
        <nav className={navClass('flex gap-5 text-sm')}>{leftLinks.map((l) => renderLink(l, '', undefined, navLinkRecipe))}</nav>
        {renderLogo('text-center text-lg font-semibold')}
        <div className="flex items-center justify-end gap-5">
          <nav className={navClass('flex gap-5 text-sm')}>{rightLinks.map((l) => renderLink(l, '', undefined, navLinkRecipe))}</nav>
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
