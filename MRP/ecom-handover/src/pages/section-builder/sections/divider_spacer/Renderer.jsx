import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';

/** US-11.H4 — transparent background is intentional; the section below shows through. */
function DividerSpacerRenderer({ data, theme, isBuilder }) {
  const { t } = useTranslation();
  const height = data.height ?? 40;

  if (data.type_variant === 'divider') {
    const color = resolveColor(data.divider_color, theme.colors);
    return (
      <div className="px-6 py-4">
        <hr style={{ borderStyle: data.divider_style ?? 'solid', borderColor: color, borderTopWidth: 1 }} />
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }} className="relative">
      {isBuilder && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-300">
          {t('sectionBuilder:sections.dividerSpacer.label', { height })}
        </span>
      )}
    </div>
  );
}

export default memo(DividerSpacerRenderer);
