import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail } from 'lucide-react';
import { resolveMedia } from '../../ui/fields/imageValue';
import SocialIcon from './SocialIcon';

/**
 * US-11.A2 — renders identically on every page (header/footer are global,
 * see builderReducer.js). Branches on `data.layout_variant` (schema.js) so
 * each site template can pick a structurally distinct footer identity
 * without any new data model beyond that one field — `columns` reproduces
 * the original single layout exactly, so existing drafts/tests without the
 * field are unaffected. Mirrors the pattern in `header/Renderer.jsx`.
 */
function FooterRenderer({ data, onNavigate, theme, mediaLibrary, isMobile }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const columns = (data.link_columns ?? []).filter((c) => (c.links ?? []).length > 0);
  const variant = data.layout_variant || 'columns';
  const copyright = data.copyright_text || t('sectionBuilder:sections.footer.copyright', { year: currentYear });
  const logoImage = resolveMedia(data.logo_image, mediaLibrary);
  const socialLinks = data.social_links ?? [];
  const hasStructuredAddress = Boolean(data.address_heading || data.address_body || data.phone || data.email);

  function renderLink(link) {
    return onNavigate ? (
      <a
        key={link.id ?? link.label}
        href={link.url || '#'}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(link.url);
        }}
        className="hover:underline"
      >
        {link.label || t('sectionBuilder:sections.common.link')}
      </a>
    ) : (
      <span key={link.id ?? link.label}>{link.label || t('sectionBuilder:sections.common.link')}</span>
    );
  }

  // Logo row — purely additive, renders nothing when both fields are
  // empty/absent (true for clothing/fnb/manufacture today).
  //
  // Two supported shapes, distinguished by whether `logo_text` is set
  // alongside `logo_image` (existing convention, unchanged):
  //  - icon + text (Xinear: a small square glyph beside a separate wordmark)
  //    stays exactly as before — h-6 w-6, gap-2, mb-4.
  //  - image-only (Houzez: `logo_image` is itself the full icon+wordmark
  //    lockup, e.g. houzez-logo.png) renders at a taller height with the
  //    image's own aspect ratio preserved (no more forced 24x24 square
  //    crop) and skips the redundant text label — matches the golden
  //    reference's `<img style={{ height: '42px', width: 'auto' }}>`.
  function renderLogoRow() {
    if (!data.logo_text && !logoImage) return null;
    const isFullLockup = logoImage && !data.logo_text;
    return (
      <div className={isFullLockup ? 'mb-8 flex items-center' : 'mb-4 flex items-center gap-2'}>
        {logoImage && (
          <img
            src={logoImage.url}
            alt=""
            aria-hidden
            className={isFullLockup ? 'h-[42px] w-auto object-contain' : 'h-6 w-6'}
          />
        )}
        {data.logo_text && <span className="text-lg font-semibold">{data.logo_text}</span>}
      </div>
    );
  }

  // Tagline vs. structured address/contact block — mutually exclusive.
  // Falls back to `tagline` exactly as today whenever all 4 structured
  // fields are empty (true for clothing/fnb/manufacture today).
  function renderTaglineOrAddress(className) {
    if (hasStructuredAddress) {
      return (
        <div className={className}>
          {data.address_heading && <p className="font-semibold">{data.address_heading}</p>}
          {data.address_body && <p className="opacity-80">{data.address_body}</p>}
          {data.phone && (
            <p className="mt-2 flex items-center gap-2 opacity-80">
              <Phone size={14} aria-hidden /> {data.phone}
            </p>
          )}
          {data.email && (
            <p className="flex items-center gap-2 opacity-80">
              <Mail size={14} aria-hidden /> {data.email}
            </p>
          )}
        </div>
      );
    }
    return data.tagline ? <p className={className}>{data.tagline}</p> : null;
  }

  function renderSocialRow() {
    if (socialLinks.length === 0) {
      return data.show_social_icons !== false ? (
        <span className="flex gap-2">{t('sectionBuilder:sections.footer.socialPlaceholder')}</span>
      ) : null;
    }
    // flex-wrap so a squeezed tablet-width column wraps to a second row
    // instead of shrinking the (shrink-0) icons out of their square shape
    // — see SocialIcon.jsx.
    return (
      <span className="flex flex-wrap items-center gap-4">
        {socialLinks.map((link, i) => <SocialIcon key={link.id ?? `${link.platform}-${i}`} platform={link.platform} url={link.url} />)}
      </span>
    );
  }

  const borderColor = theme?.colors?.border;
  const topBorderStyle = data.show_border ? { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: borderColor || undefined } : undefined;
  const topBorderClass = data.show_border && !borderColor ? 'border-t border-gray-200' : '';
  const barBorderStyle = data.show_border ? { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: borderColor || undefined } : undefined;
  // pt-4 only when the divider itself is showing — otherwise there's
  // nothing to space away from, and adding padding unconditionally would
  // change existing templates' spacing even with show_border off.
  const barBorderClass = data.show_border ? ['border-t', !borderColor && 'border-gray-200', 'pt-4'].filter(Boolean).join(' ') : '';

  if (variant === 'minimal-bar') {
    // A single slim row — copyright and social icons only, tagline and link
    // columns dropped entirely for a lean, understated footer.
    return (
      <footer className={['flex items-center justify-between px-6 py-4 text-xs opacity-70', topBorderClass].filter(Boolean).join(' ')} style={topBorderStyle}>
        <span>{copyright}</span>
        {renderSocialRow()}
      </footer>
    );
  }

  if (variant === 'centered-tagline') {
    // Centered tagline above a centered copyright line — no link columns,
    // a quieter, editorial-feeling footer.
    return (
      <footer className={['flex flex-col items-center gap-3 px-6 py-8 text-center', topBorderClass].filter(Boolean).join(' ')} style={topBorderStyle}>
        {renderLogoRow()}
        {renderTaglineOrAddress(hasStructuredAddress ? 'max-w-sm text-sm' : 'max-w-sm text-sm opacity-80')}
        <div className="flex items-center gap-3 text-xs opacity-70">
          <span>{copyright}</span>
          {renderSocialRow()}
        </div>
      </footer>
    );
  }

  // A titled social column (e.g. "Follow Us") only makes sense beside real
  // link columns — same shape as golden reference's 3rd footer column.
  // `show_social_icons` still gates whether social icons render at all;
  // `social_heading` only decides *where* (column vs. bottom bar).
  const socialAsColumn = Boolean(data.social_heading) && columns.length > 0 && data.show_social_icons !== false && socialLinks.length > 0;
  const showCopyright = data.show_copyright !== false;

  // Desktop-only balanced ratio: brand/contact column 1.5fr, link columns
  // share 2fr evenly, a trailing social column (if rendered) gets 1fr —
  // matches Houzez's ~1.5:2:1 golden reference. 'equal' (default) leaves the
  // flex-wrap/flex-1 row exactly as before — see schema.js. Neither the grid
  // ratio nor the equal-width `flex-1` row reliably wraps to one-per-row on
  // its own (both just shrink columns to fit, matching Canvas.jsx's
  // simulated device-width frame rather than the real browser viewport, so
  // CSS media queries can't be relied on here — see header/Renderer.jsx's
  // `isMobile`-prop convention for the same reason) — `isMobile` forces a
  // true single-column stack, matching the golden reference's mobile layout,
  // regardless of `column_ratio`.
  const useBalancedRatio = !isMobile && data.column_ratio === 'balanced' && columns.length > 0;
  const columnRowStyle = useBalancedRatio
    ? {
        display: 'grid',
        gridTemplateColumns: `minmax(200px, 1.5fr) repeat(${columns.length}, ${2 / columns.length}fr)${socialAsColumn ? ' 1fr' : ''}`,
      }
    : undefined;
  const columnRowClass = isMobile ? 'mb-6 flex flex-col gap-10' : useBalancedRatio ? 'mb-6 gap-8' : 'mb-6 flex flex-wrap gap-8';
  const columnCellClass = isMobile || useBalancedRatio ? 'min-w-0' : 'flex-1';

  // 'columns' (default) — tagline, link columns, and a bottom bar. Original layout.
  return (
    <footer className={['px-6 py-8', topBorderClass].filter(Boolean).join(' ')} style={topBorderStyle}>
      {renderLogoRow()}
      {columns.length > 0 ? (
        // Real two-column row: the address/tagline block sits beside the
        // link columns as a sibling flex-1 column (matching Figma's
        // side-by-side "Contact" + "Category" layout), instead of stacking
        // full-width above them. Only reachable when `columns.length > 0`,
        // which is true for `xinear` only today — clothing/fnb/manufacture
        // never populate `link_columns`, so they keep the exact previous
        // full-width-stack-then-nothing-below rendering untouched.
        <div className={columnRowClass} style={columnRowStyle}>
          <div className={columnCellClass}>
            {/* Structured address (Houzez) gets its own width cap + smaller
                type/looser leading — golden reference's equivalent brand-
                column paragraph is 13px/line-height 1.6/max-width 300px, not
                the column's full ~390px flex width, which is what was
                causing it to wrap differently. Only applies when
                hasStructuredAddress is true (Houzez today) — the plain
                `tagline` branch (Xinear) is untouched. */}
            {renderTaglineOrAddress(hasStructuredAddress ? 'max-w-[300px] text-[13px] leading-[1.6]' : 'text-sm opacity-80')}
          </div>
          {columns.map((col) => (
            <div key={col.id} className={columnCellClass}>
              <p className="mb-2 text-sm font-semibold">{col.heading || t('sectionBuilder:sections.footer.linksHeading')}</p>
              {col.links_layout === '2-column' ? (
                // Golden reference's "Category" column splits its links into
                // two vertical groups (first half / second half), not an
                // interleaved CSS grid — a plain `grid-cols-2` would fill
                // row-major (item 1 & 2 side by side) instead of golden's
                // top-to-bottom-then-wrap ordering, so the split is done here.
                (() => {
                  const linkList = col.links ?? [];
                  const half = Math.ceil(linkList.length / 2);
                  const groups = [linkList.slice(0, half), linkList.slice(half)].filter((g) => g.length > 0);
                  return (
                    <div className="flex gap-8">
                      {groups.map((group, i) => (
                        <ul key={i} className="space-y-1 text-sm opacity-80">
                          {group.map((link) => <li key={link.id ?? link.label}>{renderLink(link)}</li>)}
                        </ul>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <ul className="space-y-1 text-sm opacity-80">
                  {(col.links ?? []).map((link) => (
                    <li key={link.id ?? link.label}>{renderLink(link)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {socialAsColumn && (
            <div className={columnCellClass}>
              <p className="mb-2 text-sm font-semibold">{data.social_heading}</p>
              {renderSocialRow()}
            </div>
          )}
        </div>
      ) : (
        renderTaglineOrAddress(hasStructuredAddress ? 'mb-4 max-w-sm text-sm' : 'mb-4 max-w-sm text-sm opacity-80')
      )}
      {!showCopyright && socialAsColumn ? null : socialLinks.length > 0 ? (
        // 3-part bottom bar: icons left, copyright centered, an invisible
        // spacer right to visually balance the icon row's width
        // (~5×24px icons + 4×16px gaps ≈ 184px). Icons only appear here
        // when they haven't already been rendered as their own column above.
        <div className={['flex items-center text-xs opacity-70', barBorderClass].filter(Boolean).join(' ')} style={barBorderStyle}>
          {!socialAsColumn && <span className="flex items-center gap-4">{renderSocialRow()}</span>}
          {showCopyright && <span className="flex-1 text-center">{copyright}</span>}
          {!socialAsColumn && <span aria-hidden className="w-[184px]" />}
        </div>
      ) : (
        <div className={['flex items-center justify-between text-xs opacity-70', barBorderClass].filter(Boolean).join(' ')} style={barBorderStyle}>
          {showCopyright && <span>{copyright}</span>}
          {!socialAsColumn && renderSocialRow()}
        </div>
      )}
    </footer>
  );
}

export default memo(FooterRenderer);
