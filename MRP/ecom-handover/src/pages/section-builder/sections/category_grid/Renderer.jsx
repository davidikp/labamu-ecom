import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import EditableText from '../../ui/EditableText';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '4': 'grid-cols-4', '6': 'grid-cols-6', '8': 'grid-cols-8', '10': 'grid-cols-10' };
const MOBILE_COLS_CLASS = { '3': 'grid-cols-3', '4': 'grid-cols-4' };

function CategoryGridRenderer({ data, onEdit, isMobile, mediaLibrary }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const items = data.items ?? [];
  const colsClass = mobile
    ? MOBILE_COLS_CLASS[data.columns_mobile ?? '4'] ?? 'grid-cols-4'
    : COLS_CLASS[data.columns_desktop ?? '8'] ?? 'grid-cols-8';
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const size = data.icon_size ?? 84;

  return (
    <section className="px-6">
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
        <div className={`grid gap-x-2 gap-y-4 ${colsClass}`}>
          {items.map((item) => {
            const icon = resolveMedia(item.icon_image, mediaLibrary);
            return (
              <a key={item.id} href={item.url || undefined} className="group flex flex-col items-center gap-2 text-center">
                <div
                  className="flex items-center justify-center overflow-hidden rounded-full bg-gray-100 transition-transform duration-200 group-hover:-translate-y-1"
                  style={{ width: size, height: size }}
                >
                  {icon ? (
                    <img src={icon.url} alt={item.label} className="h-[45%] w-[45%] object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-300">{t('sectionBuilder:sections.common.noImage')}</span>
                  )}
                </div>
                <span className="text-xs font-medium leading-snug text-gray-900 sm:text-sm">{item.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default memo(CategoryGridRenderer);
