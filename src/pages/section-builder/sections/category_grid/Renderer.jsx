import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '4': 'grid-cols-4', '6': 'grid-cols-6', '8': 'grid-cols-8', '10': 'grid-cols-10' };
const TABLET_COLS_CLASS = { '3': 'grid-cols-3', '4': 'grid-cols-4', '6': 'grid-cols-6' };
const MOBILE_COLS_CLASS = { '3': 'grid-cols-3', '4': 'grid-cols-4' };

/** `icon_image` is normally `{mediaId}` (merchant-uploaded, via `resolveMedia`)
 * — but a template can also seed it as a plain public-asset path string
 * (e.g. catalog.json's own `/assets/catalog/categories/tops.png`, already
 * shared/registered nowhere in any theme's own media library), same
 * tolerant-string-or-object convention productSource.js's own
 * `resolveImageValue` already uses for product images. */
function resolveIcon(value, mediaLibrary) {
  if (typeof value === 'string') return value;
  return resolveMedia(value, mediaLibrary)?.url ?? null;
}

function CategoryGridRenderer({ data, onEdit, isMobile, breakpoint, mediaLibrary, theme, onNavigate }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const items = data.items ?? [];
  // See map_embed/testimonials/etc Renderer.jsx — the builder/preview
  // canvas simulates each device as a fixed-width frame inside a real
  // (usually wide) browser, so this reads the `breakpoint` prop Canvas.jsx
  // already passes down rather than a CSS breakpoint.
  const colsClass = mobile
    ? MOBILE_COLS_CLASS[data.columns_mobile ?? '4'] ?? 'grid-cols-4'
    : breakpoint === 'tablet'
      ? TABLET_COLS_CLASS[data.columns_tablet ?? '6'] ?? 'grid-cols-6'
      : COLS_CLASS[data.columns_desktop ?? '8'] ?? 'grid-cols-8';
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  // Icon circles shrink on mobile — matches the golden-reference Houzez
  // ratio (64px mobile / 84px desktop, ≈0.76) proportionally, so a merchant
  // who changes the desktop icon_size still gets a sensibly-scaled mobile
  // circle instead of the same fixed size at every breakpoint.
  const desktopSize = data.icon_size ?? 84;
  const size = mobile ? Math.round(desktopSize * (64 / 84)) : desktopSize;

  const iconBg = theme?.colors?.surface;
  const labelColor = theme?.colors?.text_primary;

  return (
    <StorefrontContainer as="section" theme={theme}>
      {data.show_heading && (
        onEdit ? (
          <EditableText
            as="h2"
            className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.categoryGrid.defaultHeading', 'Shop by category')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          data.heading && <h2 className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading}</h2>
        )
      )}
      {items.length === 0 ? (
        <p className="text-center text-sm text-gray-400">{t('sectionBuilder:sections.categoryGrid.emptyState', 'No categories added yet.')}</p>
      ) : (
        <div className={`grid ${colsClass}`} style={mobile ? { columnGap: 8, rowGap: 16 } : { gap: 14 }}>
          {items.map((item) => {
            const iconUrl = resolveIcon(item.icon_image, mediaLibrary);
            return (
              <a
                key={item.id}
                href={item.url || undefined}
                // A plain `href` alone would do a real full-page browser
                // navigation to e.g. '/shop' — a route this preview/live
                // storefront only ever resolves client-side via `onNavigate`
                // (see editorial_collection_list's CollectionCard, header/
                // footer nav links) — hitting it as a real URL 404s outside
                // the app. Builder canvas (no onNavigate) leaves the link
                // inert, same convention those use.
                onClick={
                  onNavigate && item.url
                    ? (e) => { e.preventDefault(); onNavigate(item.url); }
                    : (e) => e.preventDefault()
                }
                className="flex flex-col items-center gap-2 text-center transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  className={`flex items-center justify-center overflow-hidden rounded-full ${iconBg ? '' : 'bg-gray-100'}`}
                  style={{ width: size, height: size, backgroundColor: iconBg }}
                >
                  {iconUrl ? (
                    <img src={iconUrl} alt={item.label} className="h-[45%] w-[45%] object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-300">{t('sectionBuilder:sections.common.noImage')}</span>
                  )}
                </div>
                <span
                  className={`block font-medium ${labelColor ? '' : 'text-gray-900'}`}
                  style={{ fontSize: mobile ? '10px' : '13px', lineHeight: 1.4, color: labelColor }}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </StorefrontContainer>
  );
}

export default memo(CategoryGridRenderer);
