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
function FooterRenderer({ data, onNavigate, theme, mediaLibrary }) {
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
  function renderLogoRow() {
    if (!data.logo_text && !logoImage) return null;
    return (
      <div className="mb-4 flex items-center gap-2">
        {logoImage && <img src={logoImage.url} alt="" aria-hidden className="h-6 w-6" />}
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
    return (
      <span className="flex items-center gap-4">
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
        <div className="mb-6 flex flex-wrap gap-8">
          <div className="flex-1">
            {renderTaglineOrAddress(hasStructuredAddress ? 'text-sm' : 'text-sm opacity-80')}
          </div>
          {columns.map((col) => (
            <div key={col.id} className="flex-1">
              <p className="mb-2 text-sm font-semibold">{col.heading || t('sectionBuilder:sections.footer.linksHeading')}</p>
              <ul className="space-y-1 text-sm opacity-80">
                {(col.links ?? []).map((link) => (
                  <li key={link.id ?? link.label}>{renderLink(link)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        renderTaglineOrAddress(hasStructuredAddress ? 'mb-4 max-w-sm text-sm' : 'mb-4 max-w-sm text-sm opacity-80')
      )}
      {socialLinks.length > 0 ? (
        // New 3-part bottom bar: icons left, copyright centered, an
        // invisible spacer right to visually balance the icon row's width
        // (~5×24px icons + 4×16px gaps ≈ 184px).
        <div className={['flex items-center text-xs opacity-70', barBorderClass].filter(Boolean).join(' ')} style={barBorderStyle}>
          <span className="flex items-center gap-4">{renderSocialRow()}</span>
          <span className="flex-1 text-center">{copyright}</span>
          <span aria-hidden className="w-[184px]" />
        </div>
      ) : (
        <div className={['flex items-center justify-between text-xs opacity-70', barBorderClass].filter(Boolean).join(' ')} style={barBorderStyle}>
          <span>{copyright}</span>
          {renderSocialRow()}
        </div>
      )}
    </footer>
  );
}

export default memo(FooterRenderer);
