import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '4': 'grid-cols-4', '6': 'grid-cols-6', '8': 'grid-cols-8', '10': 'grid-cols-10' };
const MOBILE_COLS_CLASS = { '3': 'grid-cols-3', '4': 'grid-cols-4' };

function CategoryGridRenderer({ data, onEdit, isMobile, mediaLibrary, theme }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const items = data.items ?? [];
  const colsClass = mobile
    ? MOBILE_COLS_CLASS[data.columns_mobile ?? '4'] ?? 'grid-cols-4'
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
            const icon = resolveMedia(item.icon_image, mediaLibrary);
            return (
              <a
                key={item.id}
                href={item.url || undefined}
                className="flex flex-col items-center gap-2 text-center transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  className={`flex items-center justify-center overflow-hidden rounded-full ${iconBg ? '' : 'bg-gray-100'}`}
                  style={{ width: size, height: size, backgroundColor: iconBg }}
                >
                  {icon ? (
                    <img src={icon.url} alt={item.label} className="h-[45%] w-[45%] object-contain" />
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
