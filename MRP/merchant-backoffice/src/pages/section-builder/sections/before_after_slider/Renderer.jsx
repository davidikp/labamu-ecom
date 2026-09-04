import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import BlockStream from '../../ui/BlockStream';
import EditableText from '../../ui/EditableText';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const LABEL_BG = 'rgba(0,0,0,0.5)';
const LABEL_TEXT = '#ffffff';

function BeforeAfterSliderRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const height = mobile ? data.section_height_mobile ?? 280 : data.section_height ?? 400;
  const before = resolveMedia(data.before_image, mediaLibrary);
  const after = resolveMedia(data.after_image, mediaLibrary);
  const [position, setPosition] = useState(data.initial_divider_position ?? 50);

  const updateFromClientX = (clientX, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 5));
  };

  return (
    <section className="relative px-6">
      <BlockStream
        sectionType="before_after_slider"
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        className="mb-4 flex flex-col gap-1"
        isMobile={isMobile}
      />
      <div
        className="relative mx-auto max-w-3xl select-none overflow-hidden rounded-md bg-gray-100"
        style={{ height: `${height}px` }}
        onMouseMove={(e) => e.buttons === 1 && updateFromClientX(e.clientX, e.currentTarget)}
        onMouseDown={(e) => updateFromClientX(e.clientX, e.currentTarget)}
        onTouchMove={(e) => updateFromClientX(e.touches[0].clientX, e.currentTarget)}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
          {after ? <img src={after.url} alt={data.after_label || ''} className="h-full w-full object-cover" /> : t('sectionBuilder:sections.common.noImage')}
        </div>
        {/* Clipped via clip-path (not a width-constrained wrapper) so the
            "before" image never needs to know the container's pixel width. */}
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          {before ? <img src={before.url} alt={data.before_label || ''} className="h-full w-full object-cover" /> : t('sectionBuilder:sections.common.noImage')}
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={onKeyDown}
          className="absolute inset-y-0 flex w-1 cursor-ew-resize items-center justify-center bg-white"
          style={{ left: `${position}%` }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-600 shadow">↔</span>
        </div>
        {onEdit ? (
          <EditableText
            className="absolute bottom-2 left-2 rounded px-2 py-0.5 text-xs"
            style={{ backgroundColor: LABEL_BG, color: LABEL_TEXT }}
            value={data.before_label}
            placeholder={t('sectionBuilder:sections.beforeAfterSlider.defaultBeforeLabel')}
            onCommit={(v) => onEdit('before_label', v)}
          />
        ) : (
          <span className="absolute bottom-2 left-2 rounded px-2 py-0.5 text-xs" style={{ backgroundColor: LABEL_BG, color: LABEL_TEXT }}>
            {data.before_label || t('sectionBuilder:sections.beforeAfterSlider.defaultBeforeLabel')}
          </span>
        )}
        {onEdit ? (
          <EditableText
            className="absolute bottom-2 right-2 rounded px-2 py-0.5 text-xs"
            style={{ backgroundColor: LABEL_BG, color: LABEL_TEXT }}
            value={data.after_label}
            placeholder={t('sectionBuilder:sections.beforeAfterSlider.defaultAfterLabel')}
            onCommit={(v) => onEdit('after_label', v)}
          />
        ) : (
          <span className="absolute bottom-2 right-2 rounded px-2 py-0.5 text-xs" style={{ backgroundColor: LABEL_BG, color: LABEL_TEXT }}>
            {data.after_label || t('sectionBuilder:sections.beforeAfterSlider.defaultAfterLabel')}
          </span>
        )}
      </div>
    </section>
  );
}

export default memo(BeforeAfterSliderRenderer);
